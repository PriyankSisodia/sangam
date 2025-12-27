# auth/schemas.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: EmailStr
    class Config:
        from_attributes = True  # Pydantic v2 uses from_attributes instead of orm_mode

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
