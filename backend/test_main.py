from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import sqlite3

# Simple FastAPI app
app = FastAPI(title="Test Auth API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "test-secret-key-for-development-only"
ALGORITHM = "HS256"

# Simple in-memory database (for testing only)
users_db = {}

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "student"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    access_token: str
    token_type: str

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Truncate password to 72 bytes for bcrypt
    if len(password.encode('utf-8')) > 72:
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/")
def root():
    return {
        "message": "Test Auth API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate):
    # Check if email exists
    if user.email in [u["email"] for u in users_db.values()]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    user_id = len(users_db) + 1
    users_db[user.username] = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "password_hash": get_password_hash(user.password),
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.now().isoformat()
    }
    
    # Create token
    access_token = create_access_token(data={"sub": user.username})
    
    return UserResponse(
        id=user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        access_token=access_token,
        token_type="bearer"
    )

@app.post("/api/v1/auth/token", response_model=Token)
def login(form_data: UserLogin):
    user = users_db.get(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(current_user_id: int):
    # Find user by ID
    for username, user_data in users_db.items():
        if user_data["id"] == current_user_id:
            return UserResponse(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                access_token="",
                token_type=""
            )
    
    raise HTTPException(status_code=404, detail="User not found")

if __name__ == "__main__":
    import uvicorn
    print("Starting test server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
