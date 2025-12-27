# main.py
"""
Main FastAPI Application - This is the entry point for the backend

This file:
1. Creates the FastAPI app
2. Sets up CORS (allows frontend to make requests)
3. Creates database tables on startup
4. Registers all API routes (auth, orders, chats, catalog)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import engine, Base

# Import all routers
from auth.routes import router as auth_router
from orders.routes import router as orders_router
from chats.routes import router as chats_router
from catalog.routes import router as catalog_router

# Create the FastAPI application
app = FastAPI(
    title="Sangam Backend",
    description="Unified Communication Platform API",
    version="1.0.0"
)


# ============================================================================
# DATABASE SETUP
# ============================================================================

@app.on_event("startup")
def on_startup():
    """
    This function runs when the server starts
    
    It creates all database tables automatically based on the models
    If tables already exist, it won't recreate them
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")


# ============================================================================
# CORS SETUP (Cross-Origin Resource Sharing)
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    # These are the frontend URLs that are allowed to make requests
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "https://sangam-v1.vercel.app",  # Your deployed frontend
        "https://sangam-v2.vercel.app",  # Alternative frontend URL
    ],
    allow_credentials=True,  # Allows cookies/auth headers
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# ============================================================================
# ROUTES
# ============================================================================

@app.get("/")
def root():
    """Root endpoint - just returns a hello message"""
    return {
        "msg": "Sangam Backend API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/docs#/auth",
            "orders": "/docs#/orders",
            "chats": "/docs#/chats",
            "catalog": "/docs#/catalog"
        }
    }


# Register all routers
# This connects all the endpoints we created in routes.py files
app.include_router(auth_router)      # /signup, /login, /users/me
app.include_router(orders_router)     # /orders/* (all order endpoints)
app.include_router(chats_router)      # /chats/* (all chat endpoints)
app.include_router(catalog_router)   # /catalog/* (all catalog endpoints)

# Note: The /users/me endpoint is already in auth_router, so we don't need it here