"""
User Profile Module
用户资料管理模块
功能：用户可以查看和编辑个人资料、上传头像、修改密码
"""

from fastapi import APIRouter, HTTPException, status, UploadFile
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for user profiles
user_profiles_db = {}

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None  # ISO format

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    school_id: Optional[int]
    bio: Optional[str]
    location: Optional[str]
    website: Optional[str]
    phone: Optional[str]
    birth_date: Optional[str]
    avatar_url: Optional[str]
    created_at: str
    updated_at: str

class AvatarUploadResponse(BaseModel):
    id: int
    username: str
    avatar_url: str
    upload_date: str

# Import users_db from main app (in real implementation, this would be shared)
# For now, create a simple mock
users_db = {}

@router.get("/profiles/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int):
    # In real implementation, fetch from database
    # For now, return mock data
    return UserProfileResponse(
        id=user_id,
        username="user_" + str(user_id),
        email=f"user{user_id}@example.com",
        full_name="User " + str(user_id),
        role="student",
        school_id=None,
        bio="Bio text here",
        location="City, Country",
        website="https://example.com",
        phone="+1234567890",
        birth_date="2000-01-01",
        avatar_url="https://example.com/avatar.jpg",
        created_at="2026-01-01T00:00:00Z",
        updated_at="2026-01-01T00:00:00Z"
    )

@router.put("/profiles/{user_id}", response_model=UserProfileResponse)
def update_user_profile(user_id: int, profile_update: UserProfileUpdate):
    # In real implementation, update in database
    # For now, return mock updated data
    return UserProfileResponse(
        id=user_id,
        username="user_" + str(user_id),
        email=f"user{user_id}@example.com",
        full_name=profile_update.full_name or "User " + str(user_id),
        role="student",
        school_id=None,
        bio=profile_update.bio or "Bio text here",
        location=profile_update.location or "City, Country",
        website=profile_update.website or "https://example.com",
        phone=profile_update.phone or "+1234567890",
        birth_date=profile_update.birth_date or "2000-01-01",
        avatar_url="https://example.com/avatar.jpg",
        created_at="2026-01-01T00:00:00Z",
        updated_at=datetime.now().isoformat()
    )

@router.post("/profiles/{user_id}/avatar", response_model=AvatarUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_avatar(user_id: int, file: UploadFile):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {allowed_types}")
    
    # Validate file size (max 5MB)
    file_content = await file.read()
    file_size = len(file_content)
    max_size = 5 * 1024 * 1024  # 5MB
    
    if file_size > max_size:
        raise HTTPException(status_code=400, detail="File size too large. Max size: 5MB")
    
    # Generate avatar URL (in real implementation, store file)
    file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
    avatar_filename = f"avatar_{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    avatar_url = f"/api/v1/profiles/{user_id}/avatar/{avatar_filename}"
    
    return AvatarUploadResponse(
        id=user_id,
        username=f"user_{user_id}",
        avatar_url=avatar_url,
        upload_date=datetime.now().isoformat()
    )

@router.post("/profiles/{user_id}/password")
def change_password(user_id: int, password_request: PasswordChangeRequest):
    # In real implementation, verify old password and update new password
    # For now, just return success
    
    if not password_request.old_password:
        raise HTTPException(status_code=400, detail="Old password is required")
    
    if not password_request.new_password:
        raise HTTPException(status_code=400, detail="New password is required")
    
    if len(password_request.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    
    return {
        "message": "Password changed successfully",
        "updated_at": datetime.now().isoformat()
    }

@router.get("/profiles/{user_id}/settings")
def get_user_settings(user_id: int):
    # In real implementation, fetch user settings
    return {
        "user_id": user_id,
        "email_notifications": True,
        "push_notifications": False,
        "course_updates": True,
        "discussion_notifications": True,
        "grade_notifications": True,
        "language": "zh-CN",
        "timezone": "Asia/Shanghai"
    }

@router.put("/profiles/{user_id}/settings")
def update_user_settings(user_id: int, settings: dict):
    # In real implementation, update user settings
    return {
        "message": "Settings updated successfully",
        "updated_at": datetime.now().isoformat()
    }

@router.delete("/profiles/{user_id}/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(user_id: int, confirmation: str):
    # Confirm deletion
    if confirmation != "DELETE":
        raise HTTPException(status_code=400, detail="Confirmation required. Must send 'DELETE'")
    
    # In real implementation, delete user account and all related data
    return None

@router.get("/profiles/{user_id}/activity", status_code=status.HTTP_200_OK)
def get_user_activity(user_id: int):
    # In real implementation, fetch user activity
    return {
        "user_id": user_id,
        "last_login": "2026-01-01T00:00:00Z",
        "total_login_count": 42,
        "courses_completed": 5,
        "total_study_time_hours": 156.5,
        "total_assignments_completed": 20,
        "average_grade": 85.2,
        "recent_activities": [
            {
                "type": "login",
                "description": "Logged in from iPhone",
                "timestamp": "2026-01-01T10:30:00Z"
            },
            {
                "type": "assignment_completed",
                "description": "Completed Python Basic Assignment",
                "timestamp": "2026-01-01T15:20:00Z"
            },
            {
                "type": "course_completed",
                "description": "Completed Python Programming Course",
                "timestamp": "2026-01-01T18:45:00Z"
            }
        ]
    }
