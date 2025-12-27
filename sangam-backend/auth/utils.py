# auth/utils.py
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# IMPORTANT: replace with a strong secret or load from env in production
SECRET_KEY = os.getenv("SANGAM_SECRET_KEY", "sangam-key-for-version-v0")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: str, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode = {"sub": subject, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Use HTTPBearer for simple Bearer token authentication
# This will show a simple "Value" field in Swagger UI instead of OAuth2 form
bearer_scheme = HTTPBearer()

def get_current_user(token = Depends(bearer_scheme)):
    """
    Decodes the JWT token and returns the payload if valid,
    otherwise raises an HTTPException.
    
    Note: HTTPBearer returns a credentials object, so we access token via .credentials
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # HTTPBearer wraps the token, so we access it via .credentials
        token_string = token.credentials
        payload = jwt.decode(token_string, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return {"username": username}
    except JWTError:
        raise credentials_exception