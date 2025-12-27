# models.py
"""
Database Models - These define the structure of our database tables.

Think of models as blueprints for tables. Each class represents a table,
and each attribute (Column) represents a column in that table.

SQLAlchemy uses these models to:
1. Create tables automatically
2. Query data easily
3. Handle relationships between tables
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base


class User(Base):
    """
    User model - stores user account information
    This was already here for authentication
    """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)  # can be email
    hashed_password = Column(String, nullable=False)
    
    # Relationships: one user can have many orders, chats, etc.
    # This allows us to easily get all orders for a user
    orders = relationship("Order", back_populates="user")
    chats = relationship("Chat", back_populates="user")


class Order(Base):
    """
    Order model - stores customer order information
    
    This matches the Order interface in the frontend (src/data/orders.ts)
    Each order belongs to a user (foreign key relationship)
    """
    __tablename__ = "orders"
    
    # Primary key - unique identifier for each order
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key - links this order to a user
    # nullable=False means every order MUST have a user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Order identification
    order_id = Column(String, unique=True, index=True, nullable=False)  # e.g., "ORD-001"
    tracking_id = Column(String, nullable=True)  # Shipping tracking number
    
    # Customer information
    customer_name = Column(String, nullable=False)
    customer_contact = Column(String, nullable=True)
    
    # Product information
    product = Column(String, nullable=False)  # Product name/description
    category = Column(String, nullable=False)  # Home Decor, Art, Furniture, Textiles
    amount = Column(Float, nullable=False)  # Order total amount
    
    # Payment information
    payment_method = Column(String, nullable=False)  # Credit Card, PayPal, COD
    payment_status = Column(String, nullable=False)  # Paid, Unpaid
    payment_date = Column(DateTime, nullable=True)  # When payment was received
    
    # Delivery information
    delivery_status = Column(String, nullable=False)  # Pending, Shipped, Delivered, Cancelled
    source = Column(String, nullable=False)  # Instagram, Facebook, WhatsApp, Website
    
    # Process/workflow information
    process_status = Column(String, nullable=True, default='production')  # in_transit, production, delay
    
    # Additional information
    order_date = Column(DateTime, server_default=func.now(), nullable=False)  # Auto-set to current time
    note = Column(Text, nullable=True)  # Optional notes about the order
    rating = Column(Integer, nullable=True)  # Customer rating (1-5)
    
    # Relationship: link back to the user who owns this order
    user = relationship("User", back_populates="orders")


class Chat(Base):
    """
    Chat model - stores conversation information from different platforms
    
    This represents a conversation thread with a customer
    Each chat belongs to a user (the business owner)
    """
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Customer information
    customer_name = Column(String, nullable=False)
    platform = Column(String, nullable=False)  # WhatsApp, Facebook, Instagram
    status = Column(String, nullable=False, default="unread")  # read, unread
    
    # Last message info (for quick display in chat list)
    last_message = Column(Text, nullable=True)
    last_message_date = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Relationship: one chat has many messages
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")
    user = relationship("User", back_populates="chats")


class Message(Base):
    """
    Message model - stores individual messages within a chat
    
    Each message belongs to a chat (foreign key relationship)
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    
    # Message content
    text = Column(Text, nullable=False)
    sender = Column(String, nullable=False)  # "me" (business) or "them" (customer)
    
    # Timestamp - automatically set when message is created
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Relationship: link back to the chat this message belongs to
    chat = relationship("Chat", back_populates="messages")


class CatalogItem(Base):
    """
    CatalogItem model - stores product catalog information
    
    This matches the CatalogItem interface in the frontend (src/data/catalog.ts)
    Each catalog item belongs to a user (the business owner)
    """
    __tablename__ = "catalog_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Product information
    name = Column(String, nullable=False)
    image_url = Column(String, nullable=False)  # URL to product image
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    
    # Inventory information
    stock = Column(Integer, nullable=False, default=0)  # Items in stock
    sold = Column(Integer, nullable=False, default=0)  # Items sold
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship: link back to the user who owns this catalog item
    user = relationship("User")
