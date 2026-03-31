from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from database import get_db
from models import User, Notification, NotificationSettings
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_notifications(
    skip: int = 0,
    limit: int = 20,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.read == False)
    
    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "content": n.content,
            "data": n.data,
            "read": n.read,
            "created_at": n.created_at
        }
        for n in notifications
    ]

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Marked as read"}

@router.get("/unread-count", response_model=dict)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).count()
    
    return {"count": count}

@router.get("/settings", response_model=dict)
def get_notification_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # Create default settings
        settings = NotificationSettings(
            user_id=current_user.id,
            channels={
                "assignment_published": ["system", "email"],
                "assignment_due_soon": ["system", "push"],
                "grade_released": ["system"]
            }
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "channels": settings.channels,
        "digest_enabled": settings.digest_enabled,
        "digest_frequency": settings.digest_frequency
    }

@router.put("/settings", response_model=dict)
def update_notification_settings(
    channels: dict = None,
    digest_enabled: bool = None,
    digest_frequency: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        settings = NotificationSettings(user_id=current_user.id)
        db.add(settings)
    
    if channels is not None:
        settings.channels = channels
    if digest_enabled is not None:
        settings.digest_enabled = digest_enabled
    if digest_frequency is not None:
        settings.digest_frequency = digest_frequency
    
    db.commit()
    db.refresh(settings)
    
    return {
        "channels": settings.channels,
        "digest_enabled": settings.digest_enabled,
        "digest_frequency": settings.digest_frequency
    }
