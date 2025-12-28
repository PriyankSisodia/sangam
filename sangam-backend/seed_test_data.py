#!/usr/bin/env python
"""
Test Data Seeder - Creates realistic test data for development

This script creates sample chats, messages, orders, and catalog items
that simulate data from Instagram, WhatsApp, and Facebook.

Run this after creating your user account to populate the database with test data.
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from db import SessionLocal
from models import User, Chat, Message, Order, CatalogItem
from datetime import datetime, timedelta
import random

# Sample data
CUSTOMER_NAMES = [
    "Alice Johnson", "Bob Williams", "Charlie Brown", "Diana Prince",
    "Ethan Hunt", "Fiona Glenanne", "Grace Lee", "Henry Wilson",
    "Ivy Clark", "Jack Turner", "Liam Smith", "Mia Garcia"
]

PLATFORMS = ["Instagram", "WhatsApp", "Facebook"]
STATUSES = ["read", "unread"]

SAMPLE_MESSAGES = [
    ("Hi! Is the new collection available?", "them"),
    ("Yes, it just arrived! Would you like to see it?", "me"),
    ("That would be great! When can I come?", "them"),
    ("We're open 10am-6pm. See you soon!", "me"),
    ("Thank you for the quick shipping!", "them"),
    ("You're welcome! Hope you love it!", "me"),
    ("Loved the story you posted!", "them"),
    ("Thanks! More coming soon 😊", "me"),
    ("Can I change my delivery address?", "them"),
    ("Of course! What's the new address?", "me"),
    ("Great service!", "them"),
    ("We appreciate your feedback!", "me"),
    ("Is this still in stock?", "them"),
    ("Let me check for you...", "me"),
    ("Perfect! I'll take it.", "them"),
]

PRODUCTS = [
    "Minimalist Wall Clock", "Ceramic Vase Set", "Abstract Canvas Art",
    "Handwoven Rug", "Sculptural Table Lamp", "Oak Bookshelf",
    "Cityscape Print", "Velvet Cushion Covers", "Scented Candle Set"
]

CATEGORIES = ["Home Decor", "Art", "Furniture", "Textiles"]


def create_test_chats(db: Session, user_id: int, num_chats: int = 10):
    """Create test chats with messages"""
    print(f"Creating {num_chats} test chats...")
    
    chats_created = []
    for i in range(num_chats):
        customer_name = random.choice(CUSTOMER_NAMES)
        platform = random.choice(PLATFORMS)
        status = random.choice(STATUSES)
        
        # Create chat
        chat = Chat(
            user_id=user_id,
            customer_name=customer_name,
            platform=platform,
            status=status,
            last_message_date=datetime.utcnow() - timedelta(days=random.randint(0, 7))
        )
        db.add(chat)
        db.flush()  # Get the chat ID
        
        # Add 2-5 messages to each chat
        num_messages = random.randint(2, 5)
        messages_to_add = random.sample(SAMPLE_MESSAGES, min(num_messages, len(SAMPLE_MESSAGES)))
        
        for j, (text, sender) in enumerate(messages_to_add):
            message = Message(
                chat_id=chat.id,
                text=text,
                sender=sender,
                created_at=chat.last_message_date + timedelta(minutes=j * 10)
            )
            db.add(message)
        
        # Set last message
        if messages_to_add:
            chat.last_message = messages_to_add[-1][0]
        
        chats_created.append(chat)
    
    db.commit()
    print(f"✅ Created {len(chats_created)} chats with messages")
    return chats_created


def create_test_orders(db: Session, user_id: int, num_orders: int = 15):
    """Create test orders"""
    print(f"Creating {num_orders} test orders...")
    
    # Get ALL existing orders (order_id is globally unique, not per-user)
    # This ensures we don't create duplicate order_ids even if another user has them
    all_existing_orders = db.query(Order).all()
    
    # Find the highest order number across ALL users
    max_order_num = 0
    for order in all_existing_orders:
        if order.order_id and order.order_id.startswith("ORD-"):
            try:
                # Extract number from "ORD-001" -> 1
                num_str = order.order_id.split("-")[1]
                num = int(num_str)
                max_order_num = max(max_order_num, num)
            except (ValueError, IndexError):
                # Skip if format is wrong
                pass
    
    # Start from the next available number
    start_num = max_order_num + 1
    user_orders_count = len([o for o in all_existing_orders if o.user_id == user_id])
    print(f"   Starting from order_id: ORD-{str(start_num).zfill(3)} (found {user_orders_count} existing orders for this user, {len(all_existing_orders)} total)")
    
    orders_created = []
    for i in range(num_orders):
        order_id = f"ORD-{str(start_num + i).zfill(3)}"
        customer_name = random.choice(CUSTOMER_NAMES)
        product = random.choice(PRODUCTS)
        category = random.choice(CATEGORIES)
        
        order = Order(
            user_id=user_id,
            order_id=order_id,
            customer_name=customer_name,
            customer_contact=f"555-{str(random.randint(1000, 9999))}",
            product=product,
            category=category,
            amount=round(random.uniform(25.00, 500.00), 2),
            payment_method=random.choice(["Credit Card", "PayPal", "COD"]),
            payment_status=random.choice(["Paid", "Unpaid"]),
            payment_date=datetime.utcnow() - timedelta(days=random.randint(0, 30)) if random.random() > 0.3 else None,
            delivery_status=random.choice(["Pending", "Shipped", "Delivered", "Cancelled"]),
            source=random.choice(PLATFORMS + ["Website"]),
            tracking_id=f"1Z999AA1012345678{random.randint(0, 9)}" if random.random() > 0.4 else None,
            note=f"Customer note {i+1}" if random.random() > 0.5 else None,
            rating=random.choice([None, 1, 2, 3, 4, 5]) if random.random() > 0.6 else None,
            order_date=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        db.add(order)
        orders_created.append(order)
    
    db.commit()
    print(f"✅ Created {len(orders_created)} orders")
    return orders_created


def create_test_catalog(db: Session, user_id: int):
    """Create test catalog items"""
    print("Creating test catalog items...")
    
    catalog_items = [
        {"name": "Minimalist Wall Clock", "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop", "price": 85.00, "stock": 25, "sold": 10, "category": "Home Decor"},
        {"name": "Ceramic Vase Set", "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop", "price": 120.50, "stock": 15, "sold": 5, "category": "Home Decor"},
        {"name": "Abstract Canvas Art", "image_url": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop", "price": 310.75, "stock": 10, "sold": 3, "category": "Art"},
        {"name": "Handwoven Rug", "image_url": "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&h=600&fit=crop", "price": 250.00, "stock": 8, "sold": 2, "category": "Textiles"},
        {"name": "Sculptural Table Lamp", "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop", "price": 180.00, "stock": 20, "sold": 7, "category": "Furniture"},
        {"name": "Oak Bookshelf", "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop", "price": 450.00, "stock": 5, "sold": 1, "category": "Furniture"},
    ]
    
    items_created = []
    for item_data in catalog_items:
        item = CatalogItem(
            user_id=user_id,
            **item_data
        )
        db.add(item)
        items_created.append(item)
    
    db.commit()
    print(f"✅ Created {len(items_created)} catalog items")
    return items_created


def main():
    """Main function to seed test data"""
    print("🌱 Starting test data seeding...")
    print("=" * 50)
    
    db = SessionLocal()
    
    try:
        # Ask which user to create data for
        print("Which user should we create test data for?")
        print("1. First user in database (default)")
        print("2. Enter specific email")
        choice = input("Enter choice (1 or 2, default=1): ").strip()
        
        if choice == "2":
            email = input("Enter email: ").strip()
            user = db.query(User).filter(User.username == email).first()
            if not user:
                print(f"❌ User '{email}' not found!")
                print("   Available users:")
                all_users = db.query(User).all()
                for u in all_users:
                    chat_count = db.query(Chat).filter(Chat.user_id == u.id).count()
                    order_count = db.query(Order).filter(Order.user_id == u.id).count()
                    print(f"   - {u.username} (chats: {chat_count}, orders: {order_count})")
                return
        else:
            # Get the first user (or create one if none exists)
            user = db.query(User).first()
            if not user:
                print("❌ No user found! Please create a user account first.")
                print("   Run: Sign up via the frontend or create a user manually")
                return
        
        print(f"✅ Found user: {user.username}")
        
        # Show existing data count
        existing_chats = db.query(Chat).filter(Chat.user_id == user.id).count()
        existing_orders = db.query(Order).filter(Order.user_id == user.id).count()
        existing_catalog = db.query(CatalogItem).filter(CatalogItem.user_id == user.id).count()
        
        if existing_chats > 0 or existing_orders > 0 or existing_catalog > 0:
            print(f"   Existing data: {existing_chats} chats, {existing_orders} orders, {existing_catalog} catalog items")
            print()
        
        print()
        
        # Ask user what to create
        print("What would you like to create?")
        print("1. Chats (with messages)")
        print("2. Orders")
        print("3. Catalog items")
        print("4. Everything (recommended)")
        
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == "1":
            num = int(input("How many chats? (default 10): ") or "10")
            create_test_chats(db, user.id, num)
        elif choice == "2":
            num = int(input("How many orders? (default 15): ") or "15")
            create_test_orders(db, user.id, num)
        elif choice == "3":
            create_test_catalog(db, user.id)
        elif choice == "4":
            create_test_chats(db, user.id, 10)
            create_test_orders(db, user.id, 15)
            create_test_catalog(db, user.id)
        else:
            print("Invalid choice!")
            return
        
        print()
        print("=" * 50)
        print("✅ Test data seeding complete!")
        print()
        print("Now you can:")
        print("1. Refresh your frontend to see the new data")
        print("2. Test all features with realistic data")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()

