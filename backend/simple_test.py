from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict

app = FastAPI(title="Simple Test API", version="1.0.0")

class HealthResponse(BaseModel):
    status: str
    message: str
    users_count: int

# Simple in-memory user database
users_db: Dict[int, dict] = {}
next_user_id = 1

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "student"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str

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
    
    # Create new user (no password hashing)
    new_user = {
        "id": next_user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": "2026-03-28T00:00:00Z"
    }
    
    users_db[next_user_id] = new_user
    next_user_id += 1
    
    return UserResponse(**new_user)

@app.get("/api/v1/users")
def list_users():
    return {"users": list(users_db.values())}

if __name__ == "__main__":
    import uvicorn
    print("Starting simple test server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
