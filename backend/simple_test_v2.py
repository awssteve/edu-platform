from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

app = FastAPI(title="Simple Test API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory user database
users_db: Dict[int, dict] = {}
next_user_id = 1

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "student"
    password: str  # Added password field

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    access_token: str
    token_type: str

class HealthResponse(BaseModel):
    status: str
    message: str
    users_count: int

@app.get("/")
def root():
    return {
        "message": "Simple Test API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running",
        users_count=len(users_db)
    )

@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate):
    global next_user_id
    
    # Check if email exists
    for u in users_db.values():
        if u["email"] == user.email:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    for u in users_db.values():
        if u["username"] == user.username:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user (store password hash)
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Truncate password to 72 bytes for bcrypt
    password = user.password
    if len(password.encode('utf-8')) > 72:
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    
    new_user = {
        "id": next_user_id,
        "username": user.username,
        "email": user.email,
        "password_hash": pwd_context.hash(password),
        "full_name": user.full_name,
        "role": user.role,
        "created_at": "2026-03-28T00:00:00Z"
    }
    
    users_db[next_user_id] = new_user
    next_user_id += 1
    
    # Create token
    from jose import jwt
    from datetime import datetime, timedelta
    from config import settings
    
    access_token_expires = timedelta(minutes=30)
    access_token = jwt.encode(
        {"sub": new_user["username"], "exp": datetime.utcnow() + access_token_expires},
        settings.JWT_SECRET_KEY, algorithm="HS256"
    )
    
    return UserResponse(
        id=new_user["id"],
        username=new_user["username"],
        email=new_user["email"],
        full_name=new_user["full_name"],
        role=new_user["role"],
        access_token=access_token,
        token_type="bearer"
    )

@app.get("/api/v1/users")
def list_users():
    # Remove password from response
    safe_users = []
    for user in users_db.values():
        safe_user = user.copy()
        if "password_hash" in safe_user:
            del safe_user["password_hash"]
        safe_users.append(safe_user)
    return {"users": safe_users}

if __name__ == "__main__":
    import uvicorn
    print("Starting simple test server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
