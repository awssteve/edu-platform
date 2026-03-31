from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from database import Base

class CourseAnalytics(Base):
    __tablename__ = "course_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, unique=True)
    date = Column(String(10), default=datetime.datetime.now().strftime("%Y-%m-%d"))
    total_students = Column(Integer, default=0)
    active_students = Column(Integer, default=0)
    total_study_time_minutes = Column(Integer, default=0)
    avg_completion_rate = Column(Numeric(5, 2))
    total_assignments_submitted = Column(Integer, default=0)
    total_questions_correct = Column(Integer, default=0)
    total_questions_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("Course", back_populates="analytics")

class KnowledgePointMastery(Base):
    __tablename__ = "knowledge_point_mastery"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    knowledge_point = Column(String(200), nullable=False)
    attempt_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    mastery_rate = Column(Numeric(5, 2))
    last_practiced_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("User")
    course = relationship("Course")
