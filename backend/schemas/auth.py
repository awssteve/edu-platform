from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID

class UserRole(str):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

# TestUser schemas for auth_test.py
class TestUserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "student"

class TestUserLogin(BaseModel):
    username: str
    password: str

class TestToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TestUserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    access_token: Optional[str] = ""
    token_type: Optional[str] = ""
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Full User schemas for production
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = UserRole.STUDENT

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    role: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
