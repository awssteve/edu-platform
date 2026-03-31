from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class DiscussionTopic(Base):
    __tablename__ = "discussion_topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(String)  # 存储为逗号分隔的字符串，如 "答疑,讨论,分享"
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    last_reply_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="discussion_topics")
    creator = relationship("User", back_populates="discussion_topics")
    replies = relationship("DiscussionReply", back_populates="topic", cascade="all, delete-orphan")

class DiscussionReply(Base):
    __tablename__ = "discussion_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("discussion_topics.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    parent_reply_id = Column(UUID(as_uuid=True), ForeignKey("discussion_replies.id"))  # Nested replies
    content = Column(Text, nullable=False)
    is_teacher_reply = Column(Boolean, default=False)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    topic = relationship("DiscussionTopic", back_populates="replies")
    user = relationship("User", back_populates="discussion_replies")
    parent_reply = relationship("DiscussionReply", remote_side=[id])
    likes = relationship("DiscussionLike", back_populates="reply")

class DiscussionLike(Base):
    __tablename__ = "discussion_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reply_id = Column(UUID(as_uuid=True), ForeignKey("discussion_replies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="discussion_likes")
    reply = relationship("DiscussionReply", back_populates="likes")
