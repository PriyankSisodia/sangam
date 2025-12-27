# orders/routes.py
"""
Orders API Routes - Handle all order-related operations

This file defines the API endpoints for orders:
- GET /orders - Get all orders for the current user
- GET /orders/{order_id} - Get a specific order
- POST /orders - Create a new order
- PUT /orders/{order_id} - Update an existing order
- DELETE /orders/{order_id} - Delete an order

How it works:
1. User makes a request (e.g., GET /orders)
2. FastAPI routes it to the appropriate function below
3. Function gets the current user from the token
4. Function queries the database
5. Function returns the data as JSON
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

# Import database and auth utilities
# Note: We use relative imports with .. to go up one directory level
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from db import get_db
from auth.utils import get_current_user
from models import Order, User
import schemas

# Create a router - this groups all order-related endpoints
router = APIRouter(prefix="/orders", tags=["orders"])


def generate_order_id(db: Session, user_id: int) -> str:
    """
    Helper function to generate a unique order ID like "ORD-001"
    
    How it works:
    1. Get all existing order_ids for this user
    2. Find the highest number
    3. Add 1 to get the next number
    4. Format it as "ORD-XXX" with leading zeros
    
    This ensures uniqueness even if orders are deleted.
    """
    # Get all orders for this user
    user_orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    # Find the highest order number
    max_num = 0
    for order in user_orders:
        if order.order_id and order.order_id.startswith("ORD-"):
            try:
                num = int(order.order_id.split("-")[1])
                max_num = max(max_num, num)
            except (ValueError, IndexError):
                pass
    
    # Return next available order ID
    return f"ORD-{str(max_num + 1).zfill(3)}"


@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /orders - Get all orders for the current user
    
    What happens:
    1. Gets the current user from the JWT token (automatic via Depends)
    2. Queries the database for all orders belonging to that user
    3. Returns the orders as a JSON list
    
    Returns: List of all orders for the logged-in user
    """
    # Get username from the token
    username = current_user["username"]
    
    # Find the user in the database
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all orders for this user
    orders = db.query(Order).filter(Order.user_id == user.id).all()
    
    return orders


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /orders/{order_id} - Get a specific order by ID
    
    Parameters:
    - order_id: The database ID of the order (not the order_id string like "ORD-001")
    
    Returns: The order if found and belongs to the user
    Raises 404 if order not found or doesn't belong to user
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the order and make sure it belongs to this user
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found or you don't have permission to view it"
        )
    
    return order


@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: schemas.OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /orders - Create a new order
    
    What happens:
    1. Validates the incoming data (automatic via Pydantic)
    2. Gets the current user
    3. Generates a unique order ID
    4. Creates a new Order in the database
    5. Saves it and returns the created order
    
    Request body: OrderCreate schema (customer_name, product, amount, etc.)
    Returns: The newly created order
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate unique order ID
    order_id = generate_order_id(db, user.id)
    
    # Create new order object
    new_order = Order(
        user_id=user.id,
        order_id=order_id,
        customer_name=order_data.customer_name,
        customer_contact=order_data.customer_contact,
        product=order_data.product,
        category=order_data.category,
        amount=order_data.amount,
        payment_method=order_data.payment_method,
        payment_status=order_data.payment_status,
        payment_date=order_data.payment_date,
        delivery_status=order_data.delivery_status,
        source=order_data.source,
        process_status=order_data.process_status or 'production',
        tracking_id=order_data.tracking_id,
        note=order_data.note,
        rating=order_data.rating,
        order_date=datetime.utcnow()  # Set current date/time
    )
    
    # Add to database session
    db.add(new_order)
    # Save to database
    db.commit()
    # Refresh to get auto-generated fields
    db.refresh(new_order)
    
    return new_order


@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(
    order_id: int,
    order_data: schemas.OrderUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    PUT /orders/{order_id} - Update an existing order
    
    What happens:
    1. Finds the order
    2. Updates only the fields that were provided
    3. Saves changes to database
    
    Request body: OrderUpdate schema (all fields optional)
    Returns: The updated order
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the order
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found or you don't have permission to update it"
        )
    
    # Update only fields that were provided
    # order_data.dict(exclude_unset=True) returns only fields that were sent
    update_data = order_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)  # Dynamically set the attribute
    
    # Save changes
    db.commit()
    db.refresh(order)
    
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DELETE /orders/{order_id} - Delete an order
    
    What happens:
    1. Finds the order
    2. Deletes it from the database
    3. Returns 204 No Content (success, no response body)
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the order
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found or you don't have permission to delete it"
        )
    
    # Delete from database
    db.delete(order)
    db.commit()
    
    return None  # 204 No Content

