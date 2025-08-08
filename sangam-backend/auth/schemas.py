# auth/schemas.py
from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str
