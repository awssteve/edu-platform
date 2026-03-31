from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Date, Numeric, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class LearningRecord(Base):
    __tablename__ = "learning_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    enrollment_date = Column(Date, nullable=False)
    completion_date = Column(Date)
    total_study_time_minutes = Column(Integer, default=0)
    total_assignments_completed = Column(Integer, default=0)
    total_assignments_count = Column(Integer, default=0)
    final_score = Column(Numeric(5, 2))
    status = Column(String(20), default="enrolled")  # enrolled, in_progress, completed, dropped
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("User", back_populates="learning_records")
    course = relationship("Course", back_populates="learning_records")
    certificates = relationship("Certificate", back_populates="learning_record", uselist=False)

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learning_record_id = Column(UUID(as_uuid=True), ForeignKey("learning_records.id"), nullable=False)
    certificate_number = Column(String(50), unique=True, nullable=False)
    issue_date = Column(Date, default=func.now())
    certificate_url = Column(String(500))
    template_id = Column(String(50))
    is_revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime(timezone=True))
    revoked_reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    learning_record = relationship("LearningRecord", back_populates="certificates")
    student = relationship("User", back_populates="certificates")
