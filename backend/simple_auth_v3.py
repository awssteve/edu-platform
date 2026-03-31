from fastapi import FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from jose import jwt, JWTError
from datetime import datetime, timedelta

app = FastAPI(title="Simple Auth API", version="2.3.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT settings
SECRET_KEY = "test-secret-key-for-development-only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Simple user database (list-based)
users_list = []
next_user_id = 1

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
    refresh_token: str
    token_type: str

class HealthResponse(BaseModel):
    status: str
    message: str
    users_count: int

class UserInDB(BaseModel):
    id: int
    username: str
    email: str
    password: str
    full_name: str
    role: str
    created_at: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/")
def root():
    return {
        "message": "Simple Auth API",
        "version": "2.3.0",
        "docs": "/docs",
        "features": [
            "User Registration",
            "User Login",
            "Token Refresh",
            "Get Current User",
            "List All Users",
            "Course Management (Coming Soon)"
        ]
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running",
        users_count=len(users_list)
    )

@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate):
    global next_user_id
    
    # Check if email exists
    for u in users_list:
        if u.email == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    for u in users_list:
        if u.username == user.username:
            raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user (store in plain text for testing only!)
    new_user = UserInDB(
        id=next_user_id,
        username=user.username,
        email=user.email,
        password=user.password,
        full_name=user.full_name,
        role=user.role,
        created_at=datetime.now().isoformat()
    )
    
    users_list.append(new_user)
    next_user_id += 1
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        access_token=access_token,
        token_type="bearer"
    )

@app.post("/api/v1/auth/login", response_model=Token)
def login(form_data: UserLogin):
    # Find user by username
    user = None
    for u in users_list:
        if u.username == form_data.username:
            user = u
            break
    
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    # Simple password check (plain text comparison for testing only!)
    if user.password != form_data.password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/api/v1/auth/refresh", response_model=Token)
def refresh_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Find user
    user = None
    for u in users_list:
        if u.username == username:
            user = u
            break
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    access_token = create_access_token(data={"sub": username})
    refresh_token = create_refresh_token(data={"sub": username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Find user
    user = None
    for u in users_list:
        if u.username == username:
            user = u
            break
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    access_token = create_access_token(data={"sub": username})
    refresh_token = create_refresh_token(data={"sub": username})
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        access_token=access_token,
        token_type="bearer"
    )

@app.get("/api/v1/users")
def list_users():
    # Remove passwords from response
    safe_users = []
    for user in users_list:
        safe_users.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at
        })
    return {"users": safe_users}

if __name__ == "__main__":
    import uvicorn
    print("Starting simple auth server v2.3.0 on http://0.0.0.0:8000")
    print("Features: Register, Login, Token Refresh, Get Current User, List All Users")
    uvicorn.run(app, host="0.0.0.0", port=8000)
