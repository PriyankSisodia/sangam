# auth/routes.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import get_db
from auth.utils import get_current_user

from models import User
from auth import schemas, utils

router = APIRouter(tags=["auth"])

@router.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/signup", response_model=schemas.UserOut)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = utils.get_password_hash(user_in.password)
    user = User(username=user_in.username, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=schemas.Token)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Email not registered!")
    if not utils.verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong Password!")

    token = utils.create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}
