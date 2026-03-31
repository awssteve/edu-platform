from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class CourseReview(Base):
    __tablename__ = "course_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    overall_rating = Column(Integer, nullable=False)  # 1-5
    content_rating = Column(Integer)  # 1-5
    teaching_rating = Column(Integer)  # 1-5
    difficulty_rating = Column(Integer)  # 1-5
    review_text = Column(Text)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="reviews")
    student = relationship("User", back_populates="reviews")
