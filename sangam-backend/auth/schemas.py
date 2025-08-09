# auth/schemas.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: EmailStr
    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
