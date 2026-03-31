from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import enum
import uuid
from database import Base

class NotificationType(str, enum.Enum):
    ASSIGNMENT_PUBLISHED = "assignment_published"
    ASSIGNMENT_DUE_SOON = "assignment_due_soon"
    COURSE_MATERIAL_UPDATED = "material_updated"
    NEW_ANNOUNCEMENT = "new_announcement"
    TEACHER_REPLY = "teacher_reply"
    GRADE_RELEASED = "grade_released"

class NotificationChannel(str, enum.Enum):
    SYSTEM = "system"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WECHAT = "wechat"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # NotificationType
    title = Column(String(200))
    content = Column(Text)
    data = Column(JSON)  # Additional data
    channels = Column(String)  # 存储为逗号分隔的字符串，如 "system,email"
    read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")

class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    channels = Column(JSON)  # {"assignment_published": ["system", "email"], ...}
    digest_enabled = Column(Boolean, default=True)
    digest_frequency = Column(String(20), default="daily")  # daily, weekly, monthly
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User")
