from fastapi import APIRouter, HTTPException
from auth.schemas import User, LoginRequest
from auth.utils import pwd_context, create_access_token, users_db

router = APIRouter()

fake_users = {
    "priyank@gmail.com": "Sangam@Secure2025",
    "test@example.com": "password",
}

@router.post("/signup")
def signup(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = pwd_context.hash(user.password)
    users_db[user.username] = hashed
    return {"message": "User created successfully"}


@router.post("/login")
def login(payload: LoginRequest):
    if payload.username in fake_users and fake_users[payload.username] == payload.password:
        return {
            "message": "Login successful",
            "access_token": "fake-jwt-token-for-demo"
        }
    if payload.username not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    hashed_pass = users_db[payload.username]
    if not pwd_context.verify(payload.password, hashed_pass):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(payload.username)
    return {"access_token": token, "token_type": "bearer"}
