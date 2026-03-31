from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum, func, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
import uuid
from database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.STUDENT)
    full_name = Column(String(100))
    avatar_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships (temporarily disabled for SQLite compatibility)
    # school_teacher = relationship("SchoolTeacher", back_populates="user", uselist=False)
    # school_student = relationship("SchoolStudent", back_populates="user", uselist=False)
    # taught_courses = relationship("Course", back_populates="teacher")
    # submissions = relationship("StudentSubmission", back_populates="student")
    # learning_records = relationship("LearningRecord", back_populates="student")
    # discussion_topics = relationship("DiscussionTopic", back_populates="creator")
    # discussion_replies = relationship("DiscussionReply", back_populates="user")
    # discussion_likes = relationship("DiscussionLike", back_populates="user")
    # reviews = relationship("CourseReview", back_populates="student")
    # notifications = relationship("Notification", back_populates="user")
    # certificates = relationship("Certificate", back_populates="student")

class School(Base):
    __tablename__ = "schools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    domain = Column(String(100), unique=True, nullable=True)
    subscription_plan = Column(String(50), default="free")
    expires_at = Column(DateTime(timezone=True))
    max_students = Column(Integer, default=100)
    max_teachers = Column(Integer, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    teachers = relationship("SchoolTeacher", back_populates="school")
    students = relationship("SchoolStudent", back_populates="school")
    courses = relationship("Course", back_populates="school")

class SchoolTeacher(Base):
    __tablename__ = "school_teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    department = Column(String(100))
    position = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    school = relationship("School", back_populates="teachers")
    user = relationship("User", back_populates="school_teacher")

class SchoolStudent(Base):
    __tablename__ = "school_students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    class_name = Column(String(100))
    student_id = Column(String(50))
    enrollment_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    school = relationship("School", back_populates="students")
    user = relationship("User", back_populates="school_student")
