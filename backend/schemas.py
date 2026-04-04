from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TestUserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "student"

class TestUserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: Optional['TestUserResponse'] = None

class TestUserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
