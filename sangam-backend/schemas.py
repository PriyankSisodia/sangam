# schemas.py
"""
Pydantic Schemas - These define the structure of API requests and responses.

Think of schemas as contracts:
- Request schemas: What data the API expects to receive
- Response schemas: What data the API will send back

Pydantic automatically:
1. Validates incoming data (type checking, required fields)
2. Converts data types (e.g., string to int)
3. Provides clear error messages if data is invalid

This is different from models.py:
- models.py = Database structure (how data is stored)
- schemas.py = API structure (how data is sent/received)
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ============================================================================
# ORDER SCHEMAS
# ============================================================================

class OrderBase(BaseModel):
    """Base schema with common order fields - used for creating and updating"""
    customer_name: str
    customer_contact: Optional[str] = None
    product: str
    category: str  # Home Decor, Art, Furniture, Textiles
    amount: float
    payment_method: str  # Credit Card, PayPal, COD
    payment_status: str  # Paid, Unpaid
    payment_date: Optional[datetime] = None
    delivery_status: str  # Pending, Shipped, Delivered, Cancelled
    source: str  # Instagram, Facebook, WhatsApp, Website
    process_status: Optional[str] = 'production'  # in_transit, production, delay
    tracking_id: Optional[str] = None
    note: Optional[str] = None
    rating: Optional[int] = None


class OrderCreate(OrderBase):
    """
    Schema for creating a new order
    Note: order_id and order_date are auto-generated, so not needed here
    """
    pass  # Inherits all fields from OrderBase


class OrderUpdate(BaseModel):
    """
    Schema for updating an order
    All fields are optional - only provided fields will be updated
    """
    customer_name: Optional[str] = None
    customer_contact: Optional[str] = None
    product: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    payment_date: Optional[datetime] = None
    delivery_status: Optional[str] = None
    source: Optional[str] = None
    process_status: Optional[str] = None
    tracking_id: Optional[str] = None
    note: Optional[str] = None
    rating: Optional[int] = None


class OrderResponse(OrderBase):
    """
    Schema for order responses
    Includes the auto-generated fields (id, order_id, order_date)
    """
    id: int
    order_id: str
    order_date: datetime
    
    class Config:
        """Tells Pydantic to read from ORM objects (SQLAlchemy models)"""
        from_attributes = True


# ============================================================================
# CHAT SCHEMAS
# ============================================================================

class MessageBase(BaseModel):
    """Base schema for messages"""
    text: str
    sender: str  # "me" or "them"


class MessageCreate(MessageBase):
    """Schema for creating a new message"""
    pass


class MessageResponse(MessageBase):
    """Schema for message responses"""
    id: int
    chat_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatBase(BaseModel):
    """Base schema with common chat fields"""
    customer_name: str
    platform: str  # WhatsApp, Facebook, Instagram
    status: str = "unread"  # read, unread


class ChatCreate(ChatBase):
    """Schema for creating a new chat"""
    pass


class ChatUpdate(BaseModel):
    """Schema for updating a chat"""
    customer_name: Optional[str] = None
    platform: Optional[str] = None
    status: Optional[str] = None
    last_message: Optional[str] = None


class ChatResponse(ChatBase):
    """Schema for chat responses - includes messages"""
    id: int
    last_message: Optional[str] = None
    last_message_date: datetime
    messages: List[MessageResponse] = []  # List of messages in this chat
    
    class Config:
        from_attributes = True


# ============================================================================
# CATALOG SCHEMAS
# ============================================================================

class CatalogItemBase(BaseModel):
    """Base schema with common catalog item fields"""
    name: str
    image_url: str
    price: float
    category: str
    stock: int = 0
    sold: int = 0


class CatalogItemCreate(CatalogItemBase):
    """Schema for creating a new catalog item"""
    pass


class CatalogItemUpdate(BaseModel):
    """Schema for updating a catalog item"""
    name: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    sold: Optional[int] = None


class CatalogItemResponse(CatalogItemBase):
    """Schema for catalog item responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

