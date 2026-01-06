# instagram/routes.py
"""
Instagram Integration Routes - Handle Instagram account connection and message syncing

Endpoints:
- GET /instagram/connect - Get Instagram OAuth URL
- GET /instagram/callback - OAuth callback handler
- GET /instagram/status - Check connection status
- POST /instagram/sync - Manually sync Instagram messages
- DELETE /instagram/disconnect - Disconnect Instagram account
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import os
import requests
from urllib.parse import urlencode

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from db import get_db
from auth.utils import get_current_user
from models import InstagramConnection, User, Chat, Message

router = APIRouter(prefix="/instagram", tags=["instagram"])

# Instagram API Configuration
# These should be set as environment variables
INSTAGRAM_APP_ID = os.getenv("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_REDIRECT_URI = os.getenv("INSTAGRAM_REDIRECT_URI", "http://localhost:8000/instagram/callback")
FACEBOOK_API_VERSION = "v18.0"
INSTAGRAM_API_BASE = f"https://graph.facebook.com/{FACEBOOK_API_VERSION}"


@router.get("/connect")
def get_instagram_oauth_url(
    current_user: dict = Depends(get_current_user)
):
    """
    GET /instagram/connect - Get Instagram OAuth URL
    
    Returns the URL to redirect user to for Instagram authorization
    """
    if not INSTAGRAM_APP_ID:
        raise HTTPException(
            status_code=500,
            detail="Instagram App ID not configured. Please set INSTAGRAM_APP_ID environment variable."
        )
    
    # Build OAuth URL
    params = {
        "client_id": INSTAGRAM_APP_ID,
        "redirect_uri": INSTAGRAM_REDIRECT_URI,
        "scope": "instagram_basic,instagram_manage_messages,pages_read_engagement",
        "response_type": "code",
        "state": current_user["username"]  # Use username as state to identify user
    }
    
    oauth_url = f"https://www.facebook.com/{FACEBOOK_API_VERSION}/dialog/oauth?{urlencode(params)}"
    
    return {
        "oauth_url": oauth_url,
        "message": "Redirect user to this URL to connect Instagram account"
    }


@router.get("/callback")
async def instagram_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    GET /instagram/callback - OAuth callback handler
    
    This endpoint is called by Instagram after user authorizes the app
    """
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    if not state:
        raise HTTPException(status_code=400, detail="State parameter missing")
    
    # Find user by username (state)
    user = db.query(User).filter(User.username == state).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Exchange code for short-lived access token
        token_url = f"{INSTAGRAM_API_BASE}/oauth/access_token"
        token_params = {
            "client_id": INSTAGRAM_APP_ID,
            "client_secret": INSTAGRAM_APP_SECRET,
            "redirect_uri": INSTAGRAM_REDIRECT_URI,
            "code": code
        }
        
        token_response = requests.get(token_url, params=token_params)
        token_data = token_response.json()
        
        if "error" in token_data:
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {token_data['error']}")
        
        short_lived_token = token_data.get("access_token")
        
        # Exchange short-lived token for long-lived token (60 days)
        long_token_url = f"{INSTAGRAM_API_BASE}/oauth/access_token"
        long_token_params = {
            "grant_type": "fb_exchange_token",
            "client_id": INSTAGRAM_APP_ID,
            "client_secret": INSTAGRAM_APP_SECRET,
            "fb_exchange_token": short_lived_token
        }
        
        long_token_response = requests.get(long_token_url, params=long_token_params)
        long_token_data = long_token_response.json()
        
        if "error" in long_token_data:
            # If long-lived token exchange fails, use short-lived token
            access_token = short_lived_token
            expires_in = token_data.get("expires_in", 3600)  # Default 1 hour
        else:
            access_token = long_token_data.get("access_token")
            expires_in = long_token_data.get("expires_in", 5184000)  # 60 days in seconds
        
        # Get Instagram Business Account ID
        accounts_url = f"{INSTAGRAM_API_BASE}/me/accounts"
        accounts_response = requests.get(accounts_url, params={"access_token": access_token})
        accounts_data = accounts_response.json()
        
        if "error" in accounts_data or not accounts_data.get("data"):
            raise HTTPException(
                status_code=400,
                detail="No Instagram Business Account found. Please connect a Business account."
            )
        
        # Get the first page (should have Instagram account connected)
        page = accounts_data["data"][0]
        page_id = page["id"]
        page_access_token = page.get("access_token", access_token)
        
        # Get Instagram Business Account connected to this page
        instagram_accounts_url = f"{INSTAGRAM_API_BASE}/{page_id}"
        instagram_params = {
            "fields": "instagram_business_account",
            "access_token": page_access_token
        }
        instagram_response = requests.get(instagram_accounts_url, params=instagram_params)
        instagram_data = instagram_response.json()
        
        if "error" in instagram_data or not instagram_data.get("instagram_business_account"):
            raise HTTPException(
                status_code=400,
                detail="No Instagram Business Account connected to this Facebook Page."
            )
        
        ig_account_id = instagram_data["instagram_business_account"]["id"]
        
        # Get Instagram account details
        ig_account_url = f"{INSTAGRAM_API_BASE}/{ig_account_id}"
        ig_account_params = {
            "fields": "username,name",
            "access_token": page_access_token
        }
        ig_account_response = requests.get(ig_account_url, params=ig_account_params)
        ig_account_data = ig_account_response.json()
        
        instagram_username = ig_account_data.get("username", "")
        instagram_name = ig_account_data.get("name", "")
        
        # Calculate token expiration
        token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in) if expires_in else None
        
        # Save or update connection
        existing_connection = db.query(InstagramConnection).filter(
            InstagramConnection.user_id == user.id
        ).first()
        
        if existing_connection:
            existing_connection.instagram_account_id = ig_account_id
            existing_connection.instagram_username = instagram_username
            existing_connection.instagram_account_name = instagram_name
            existing_connection.access_token = page_access_token
            existing_connection.token_expires_at = token_expires_at
            existing_connection.is_active = True
            existing_connection.updated_at = datetime.utcnow()
        else:
            new_connection = InstagramConnection(
                user_id=user.id,
                instagram_account_id=ig_account_id,
                instagram_username=instagram_username,
                instagram_account_name=instagram_name,
                access_token=page_access_token,
                token_expires_at=token_expires_at,
                is_active=True
            )
            db.add(new_connection)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Instagram account connected successfully",
            "instagram_username": instagram_username,
            "instagram_name": instagram_name
        }
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect Instagram: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/status")
def get_instagram_status(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /instagram/status - Check Instagram connection status
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    connection = db.query(InstagramConnection).filter(
        InstagramConnection.user_id == user.id
    ).first()
    
    if not connection:
        return {
            "connected": False,
            "message": "No Instagram account connected"
        }
    
    # Check if token is expired
    is_expired = False
    if connection.token_expires_at:
        is_expired = datetime.utcnow() > connection.token_expires_at
    
    return {
        "connected": connection.is_active and not is_expired,
        "instagram_username": connection.instagram_username,
        "instagram_name": connection.instagram_account_name,
        "connected_at": connection.connected_at.isoformat() if connection.connected_at else None,
        "last_sync_at": connection.last_sync_at.isoformat() if connection.last_sync_at else None,
        "token_expired": is_expired
    }


@router.post("/sync")
def sync_instagram_messages(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /instagram/sync - Manually sync Instagram messages
    
    Fetches conversations from Instagram and creates/updates chats in the database
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    connection = db.query(InstagramConnection).filter(
        InstagramConnection.user_id == user.id,
        InstagramConnection.is_active == True
    ).first()
    
    if not connection:
        raise HTTPException(status_code=400, detail="No active Instagram connection found")
    
    # Check if token is expired
    if connection.token_expires_at and datetime.utcnow() > connection.token_expires_at:
        raise HTTPException(status_code=401, detail="Instagram access token has expired. Please reconnect.")
    
    try:
        # Get conversations from Instagram
        conversations_url = f"{INSTAGRAM_API_BASE}/{connection.instagram_account_id}/conversations"
        conversations_params = {
            "fields": "participants,updated_time",
            "access_token": connection.access_token
        }
        
        conversations_response = requests.get(conversations_url, params=conversations_params)
        conversations_data = conversations_response.json()
        
        if "error" in conversations_data:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch conversations: {conversations_data['error']['message']}"
            )
        
        conversations = conversations_data.get("data", [])
        synced_count = 0
        
        for conv in conversations:
            # Get conversation ID
            conv_id = conv.get("id")
            if not conv_id:
                continue
            
            # Get messages for this conversation
            messages_url = f"{INSTAGRAM_API_BASE}/{conv_id}/messages"
            messages_params = {
                "fields": "from,message,created_time",
                "access_token": connection.access_token
            }
            
            messages_response = requests.get(messages_url, params=messages_params)
            messages_data = messages_response.json()
            
            if "error" in messages_data:
                continue
            
            messages_list = messages_data.get("data", [])
            if not messages_list:
                continue
            
            # Get participant name (customer)
            participants = conv.get("participants", {}).get("data", [])
            customer_name = "Instagram User"
            if participants:
                # The participant that's not us is the customer
                for participant in participants:
                    if participant.get("id") != connection.instagram_account_id:
                        customer_name = participant.get("name", "Instagram User")
                        break
            
            # Find or create chat
            chat = db.query(Chat).filter(
                Chat.user_id == user.id,
                Chat.platform == "Instagram",
                Chat.customer_name == customer_name
            ).first()
            
            if not chat:
                chat = Chat(
                    user_id=user.id,
                    customer_name=customer_name,
                    platform="Instagram",
                    status="unread",
                    last_message_date=datetime.utcnow()
                )
                db.add(chat)
                db.flush()
            
            # Add messages (only new ones)
            existing_message_texts = {msg.text for msg in chat.messages}
            
            for msg_data in reversed(messages_list):  # Reverse to get chronological order
                message_text = msg_data.get("message", "")
                if not message_text or message_text in existing_message_texts:
                    continue
                
                # Determine sender
                from_id = msg_data.get("from", {}).get("id", "")
                sender = "me" if from_id == connection.instagram_account_id else "them"
                
                # Parse created time
                created_time_str = msg_data.get("created_time", "")
                created_at = datetime.utcnow()
                if created_time_str:
                    try:
                        created_at = datetime.fromisoformat(created_time_str.replace("Z", "+00:00"))
                    except:
                        pass
                
                message = Message(
                    chat_id=chat.id,
                    text=message_text,
                    sender=sender,
                    created_at=created_at
                )
                db.add(message)
                
                # Update chat's last message
                chat.last_message = message_text
                chat.last_message_date = created_at
                if sender == "them":
                    chat.status = "unread"
            
            synced_count += 1
        
        # Update last sync time
        connection.last_sync_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": f"Synced {synced_count} conversations from Instagram",
            "conversations_synced": synced_count
        }
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync Instagram messages: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.delete("/disconnect")
def disconnect_instagram(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DELETE /instagram/disconnect - Disconnect Instagram account
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    connection = db.query(InstagramConnection).filter(
        InstagramConnection.user_id == user.id
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="No Instagram connection found")
    
    connection.is_active = False
    db.commit()
    
    return {
        "success": True,
        "message": "Instagram account disconnected successfully"
    }

