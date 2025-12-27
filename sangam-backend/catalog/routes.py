# catalog/routes.py
"""
Catalog API Routes - Handle all product catalog operations

Endpoints:
- GET /catalog - Get all catalog items for the current user
- GET /catalog/{item_id} - Get a specific catalog item
- POST /catalog - Create a new catalog item
- PUT /catalog/{item_id} - Update a catalog item
- DELETE /catalog/{item_id} - Delete a catalog item
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Fix imports to work from subdirectory
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from db import get_db
from auth.utils import get_current_user
from models import CatalogItem, User
import schemas

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/", response_model=List[schemas.CatalogItemResponse])
def get_catalog_items(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /catalog - Get all catalog items for the current user
    
    Returns: List of all products in the catalog
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all catalog items for this user
    items = db.query(CatalogItem).filter(CatalogItem.user_id == user.id).all()
    
    return items


@router.get("/{item_id}", response_model=schemas.CatalogItemResponse)
def get_catalog_item(
    item_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /catalog/{item_id} - Get a specific catalog item
    
    Returns: The catalog item if found and belongs to the user
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the item and make sure it belongs to this user
    item = db.query(CatalogItem).filter(
        CatalogItem.id == item_id,
        CatalogItem.user_id == user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Catalog item not found or you don't have permission to view it"
        )
    
    return item


@router.post("/", response_model=schemas.CatalogItemResponse, status_code=status.HTTP_201_CREATED)
def create_catalog_item(
    item_data: schemas.CatalogItemCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /catalog - Create a new catalog item
    
    Creates a new product in the catalog with name, price, stock, etc.
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new catalog item
    new_item = CatalogItem(
        user_id=user.id,
        name=item_data.name,
        image_url=item_data.image_url,
        price=item_data.price,
        category=item_data.category,
        stock=item_data.stock,
        sold=item_data.sold
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item


@router.put("/{item_id}", response_model=schemas.CatalogItemResponse)
def update_catalog_item(
    item_id: int,
    item_data: schemas.CatalogItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    PUT /catalog/{item_id} - Update a catalog item
    
    Updates product information like price, stock, name, etc.
    The updated_at timestamp is automatically updated by the model.
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the item
    item = db.query(CatalogItem).filter(
        CatalogItem.id == item_id,
        CatalogItem.user_id == user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Catalog item not found or you don't have permission to update it"
        )
    
    # Update only provided fields
    update_data = item_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    # The model will automatically update updated_at timestamp
    db.commit()
    db.refresh(item)
    
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_catalog_item(
    item_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DELETE /catalog/{item_id} - Delete a catalog item
    
    Removes the product from the catalog
    """
    username = current_user["username"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the item
    item = db.query(CatalogItem).filter(
        CatalogItem.id == item_id,
        CatalogItem.user_id == user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Catalog item not found or you don't have permission to delete it"
        )
    
    db.delete(item)
    db.commit()
    
    return None

