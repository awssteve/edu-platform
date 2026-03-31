from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Numeric, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
import datetime
from database import Base

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    material_id = Column(UUID(as_uuid=True), ForeignKey("course_materials.id"))
    completed_pages = Column(Integer, default=0)
    total_pages = Column(Integer)
    last_position = Column(DateTime(timezone=True))
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("User")
    course = relationship("Course")
    material = relationship("CourseMaterial")

class LearningAnalytics(Base):
    __tablename__ = "learning_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    total_study_time_minutes = Column(Integer, default=0)
    correct_rate = Column(Numeric(5, 2))
    weak_points = Column(JSON)  # Weak knowledge points
    recommendations = Column(JSON)  # AI recommendations
    report_date = Column(String(10), default=datetime.datetime.now().strftime("%Y-%m-%d"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("User")
    course = relationship("Course")
