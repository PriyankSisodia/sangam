# chats/routes.py
"""
Chats API Routes - Handle all chat/conversation operations

Endpoints:
- GET /chats - Get all chats for the current user
- GET /chats/{chat_id} - Get a specific chat with all messages
- POST /chats - Create a new chat
- PUT /chats/{chat_id} - Update a chat (e.g., mark as read)
- DELETE /chats/{chat_id} - Delete a chat
- POST /chats/{chat_id}/messages - Add a message to a chat
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from pydantic import BaseModel

# Fix imports to work from subdirectory
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from db import get_db
from auth.utils import get_current_user
from models import Chat, Message, User
import schemas

router = APIRouter(prefix="/chats", tags=["chats"])


@router.get("/", response_model=List[schemas.ChatResponse])
def get_chats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /chats - Get all chats for the current user
    
    Returns: List of all chats with their messages
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all chats for this user, ordered by last message date (newest first)
    chats = db.query(Chat).filter(Chat.user_id == user.id).order_by(
        Chat.last_message_date.desc()
    ).all()
    
    return chats


@router.get("/{chat_id}", response_model=schemas.ChatResponse)
def get_chat(
    chat_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /chats/{chat_id} - Get a specific chat with all messages
    
    Returns: The chat with all its messages
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the chat and make sure it belongs to this user
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found or you don't have permission to view it"
        )
    
    return chat


@router.post("/", response_model=schemas.ChatResponse, status_code=status.HTTP_201_CREATED)
def create_chat(
    chat_data: schemas.ChatCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /chats - Create a new chat/conversation
    
    Creates a new chat thread with a customer from a specific platform
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new chat
    new_chat = Chat(
        user_id=user.id,
        customer_name=chat_data.customer_name,
        platform=chat_data.platform,
        status=chat_data.status,
        last_message_date=datetime.utcnow()
    )
    
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    
    return new_chat


@router.put("/{chat_id}", response_model=schemas.ChatResponse)
def update_chat(
    chat_id: int,
    chat_data: schemas.ChatUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    PUT /chats/{chat_id} - Update a chat
    
    Commonly used to:
    - Mark chat as read/unread
    - Update last message
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the chat
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found or you don't have permission to update it"
        )
    
    # Update only provided fields
    update_data = chat_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chat, field, value)
    
    # If updating last_message, also update last_message_date
    if "last_message" in update_data:
        chat.last_message_date = datetime.utcnow()
    
    db.commit()
    db.refresh(chat)
    
    return chat


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DELETE /chats/{chat_id} - Delete a chat and all its messages
    
    Note: Due to cascade="all, delete-orphan" in the model,
    all messages will be automatically deleted too
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the chat
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found or you don't have permission to delete it"
        )
    
    db.delete(chat)
    db.commit()
    
    return None


@router.post("/{chat_id}/messages", response_model=schemas.MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    chat_id: int,
    message_data: schemas.MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /chats/{chat_id}/messages - Add a message to a chat
    
    This is used when:
    - Customer sends a message (sender="them")
    - Business replies (sender="me")
    
    Also updates the chat's last_message and last_message_date
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the chat and verify it belongs to the user
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found or you don't have permission to add messages to it"
        )
    
    # Create new message
    new_message = Message(
        chat_id=chat_id,
        text=message_data.text,
        sender=message_data.sender,
        created_at=datetime.utcnow()
    )
    
    # Update chat's last message info
    chat.last_message = message_data.text
    chat.last_message_date = datetime.utcnow()
    
    # If message is from business, mark chat as read
    if message_data.sender == "me":
        chat.status = "read"
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return new_message


# Schema for creating chat with messages
class CreateChatWithMessagesRequest(BaseModel):
    customer_name: str
    platform: str
    status: str = "unread"
    messages: List[dict]  # List of {text: str, sender: str}


@router.post("/create-with-messages", response_model=schemas.ChatResponse, status_code=status.HTTP_201_CREATED)
def create_chat_with_messages(
    request_data: CreateChatWithMessagesRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /chats/create-with-messages - Create a chat with initial messages
    
    Useful for importing chats from Instagram/WhatsApp or creating test data.
    
    Example request body:
    {
        "customer_name": "Alice Johnson",
        "platform": "Instagram",
        "status": "unread",
        "messages": [
            {"text": "Hi! Is this available?", "sender": "them"},
            {"text": "Yes, it is!", "sender": "me"}
        ]
    }
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create chat
    new_chat = Chat(
        user_id=user.id,
        customer_name=request_data.customer_name,
        platform=request_data.platform,
        status=request_data.status,
        last_message_date=datetime.utcnow()
    )
    db.add(new_chat)
    db.flush()  # Get the chat ID
    
    # Add messages
    if request_data.messages:
        for i, msg_data in enumerate(request_data.messages):
            message = Message(
                chat_id=new_chat.id,
                text=msg_data.get("text", ""),
                sender=msg_data.get("sender", "them"),
                created_at=datetime.utcnow() - timedelta(minutes=len(request_data.messages) - i)
            )
            db.add(message)
        
        # Set last message
        new_chat.last_message = request_data.messages[-1].get("text", "")
    
    db.commit()
    db.refresh(new_chat)
    
    return new_chat

