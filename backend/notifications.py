"""
Notification System Module
通知系统模块
功能：系统通知、邮件通知、通知管理
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for notifications
notifications_db = {}
next_notification_id = 1

# Simple database for notification settings
notification_settings_db = {}
next_settings_id = 1

class NotificationCreate(BaseModel):
    user_id: int
    notification_type: str  # system, assignment, course, discussion
    title: str
    message: str
    priority: str = "normal"  # low, normal, high, urgent
    action_url: Optional[str] = None
    action_text: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    notification_type: str
    title: str
    message: str
    priority: str
    is_read: bool
    action_url: Optional[str]
    action_text: Optional[str]
    created_at: str
    read_at: Optional[str]

class NotificationSettingsCreate(BaseModel):
    user_id: int
    email_notifications: bool = True
    system_notifications: bool = True
    assignment_notifications: bool = True
    course_notifications: bool = True
    discussion_notifications: bool = True

class NotificationSettingsResponse(BaseModel):
    id: int
    user_id: int
    email_notifications: bool
    system_notifications: bool
    assignment_notifications: bool
    course_notifications: bool
    discussion_notifications: bool
    created_at: str
    updated_at: str

# ===== Notifications =====

@router.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(notification: NotificationCreate):
    global next_notification_id
    
    new_notification = {
        "id": next_notification_id,
        "user_id": notification.user_id,
        "notification_type": notification.notification_type,
        "title": notification.title,
        "message": notification.message,
        "priority": notification.priority,
        "is_read": False,
        "action_url": notification.action_url,
        "action_text": notification.action_text,
        "created_at": datetime.now().isoformat(),
        "read_at": None
    }
    
    notifications_db[next_notification_id] = new_notification
    next_notification_id += 1
    
    return NotificationResponse(**new_notification)

@router.get("/notifications", response_model=List[NotificationResponse])
def list_notifications(
    user_id: Optional[int] = None,
    notification_type: Optional[str] = None,
    is_read: Optional[bool] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_notifications = []
    
    for n in notifications_db.values():
        # Filter by user
        if user_id is not None and n["user_id"] != user_id:
            continue
        
        # Filter by type
        if notification_type is not None and n["notification_type"] != notification_type:
            continue
        
        # Filter by read status
        if is_read is not None and n["is_read"] != is_read:
            continue
        
        # Filter by priority
        if priority is not None and n["priority"] != priority:
            continue
        
        filtered_notifications.append(n)
    
    # Sort: unread first, then by priority (urgent first), then by created date (newest first)
    priority_order = {"urgent": 0, "high": 1, "normal": 2, "low": 3}
    filtered_notifications.sort(key=lambda x: (x["is_read"], priority_order.get(x["priority"], 4), x["created_at"]), reverse=True)
    
    # Pagination
    filtered_notifications = filtered_notifications[skip:skip+limit]
    
    return filtered_notifications

@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
def get_notification(notification_id: int):
    notification = notifications_db.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return NotificationResponse(**notification)

@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(notification_id: int):
    notification = notifications_db.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification["is_read"] = True
    notification["read_at"] = datetime.now().isoformat()
    
    return NotificationResponse(**notification)

@router.put("/notifications/user/{user_id}/mark-all-read", status_code=status.HTTP_200_OK)
def mark_all_as_read(user_id: int):
    count = 0
    
    for n in notifications_db.values():
        if n["user_id"] == user_id and not n["is_read"]:
            n["is_read"] = True
            n["read_at"] = datetime.now().isoformat()
            count += 1
    
    return {"message": f"Marked {count} notifications as read"}

@router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: int):
    notification = notifications_db.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    del notifications_db[notification_id]
    
    return None

@router.get("/notifications/user/{user_id}/unread-count", status_code=status.HTTP_200_OK)
def get_unread_count(user_id: int):
    count = 0
    
    for n in notifications_db.values():
        if n["user_id"] == user_id and not n["is_read"]:
            count += 1
    
    return {"unread_count": count}

# ===== Notification Settings =====

@router.post("/notifications/settings", response_model=NotificationSettingsResponse, status_code=status.HTTP_201_CREATED)
def create_notification_settings(settings: NotificationSettingsCreate):
    global next_settings_id
    
    # Check if user already has settings
    for s in notification_settings_db.values():
        if s["user_id"] == settings.user_id:
            raise HTTPException(status_code=400, detail="Notification settings already exist for this user")
    
    new_settings = {
        "id": next_settings_id,
        "user_id": settings.user_id,
        "email_notifications": settings.email_notifications,
        "system_notifications": settings.system_notifications,
        "assignment_notifications": settings.assignment_notifications,
        "course_notifications": settings.course_notifications,
        "discussion_notifications": settings.discussion_notifications,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    notification_settings_db[next_settings_id] = new_settings
    next_settings_id += 1
    
    return NotificationSettingsResponse(**new_settings)

@router.get("/notifications/settings/user/{user_id}", response_model=NotificationSettingsResponse)
def get_notification_settings(user_id: int):
    settings = None
    for s in notification_settings_db.values():
        if s["user_id"] == user_id:
            settings = s
            break
    
    if not settings:
        # Return default settings
        return NotificationSettingsResponse(
            id=0,
            user_id=user_id,
            email_notifications=True,
            system_notifications=True,
            assignment_notifications=True,
            course_notifications=True,
            discussion_notifications=True,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat()
        )
    
    return NotificationSettingsResponse(**settings)

@router.put("/notifications/settings/user/{user_id}", response_model=NotificationSettingsResponse)
def update_notification_settings(user_id: int, settings_update: dict):
    settings = None
    for s in notification_settings_db.values():
        if s["user_id"] == user_id:
            settings = s
            break
    
    if not settings:
        # Create new settings if not exist
        global next_settings_id
        settings = {
            "id": next_settings_id,
            "user_id": user_id,
            "email_notifications": True,
            "system_notifications": True,
            "assignment_notifications": True,
            "course_notifications": True,
            "discussion_notifications": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        notification_settings_db[next_settings_id] = settings
        next_settings_id += 1
    
    # Update fields
    if "email_notifications" in settings_update:
        settings["email_notifications"] = settings_update["email_notifications"]
    if "system_notifications" in settings_update:
        settings["system_notifications"] = settings_update["system_notifications"]
    if "assignment_notifications" in settings_update:
        settings["assignment_notifications"] = settings_update["assignment_notifications"]
    if "course_notifications" in settings_update:
        settings["course_notifications"] = settings_update["course_notifications"]
    if "discussion_notifications" in settings_update:
        settings["discussion_notifications"] = settings_update["discussion_notifications"]
    
    settings["updated_at"] = datetime.now().isoformat()
    
    return NotificationSettingsResponse(**settings)
