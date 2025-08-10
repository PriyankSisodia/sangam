# main.py
from fastapi import FastAPI
from fastapi import Depends
from auth.utils import get_current_user

from fastapi.middleware.cors import CORSMiddleware
from db import engine, Base
from auth.routes import router as auth_router

app = FastAPI(title="Sangam Backend")


# Create DB tables at startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# CORS (allow dev frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000","https://sangam-v2.vercel.app"],  # adjust if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"msg": "hello"}

app.include_router(auth_router)

@app.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user