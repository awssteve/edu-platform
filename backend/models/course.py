from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    cover_url = Column(String(500))
    is_published = Column(Boolean, default=False)
    tags = Column(String)  # 存储为逗号分隔的字符串
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    school = relationship("School", back_populates="courses")
    teacher = relationship("User", back_populates="taught_courses")
    materials = relationship("CourseMaterial", back_populates="course", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="course", cascade="all, delete-orphan")
    discussion_topics = relationship("DiscussionTopic", back_populates="course", cascade="all, delete-orphan")
    reviews = relationship("CourseReview", back_populates="course", cascade="all, delete-orphan")
    learning_records = relationship("LearningRecord", back_populates="course")
    analytics = relationship("CourseAnalytics", back_populates="course")

class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, ppt, pptx, doc, docx, mp4
    file_size = Column(Integer)
    pages = Column(Integer)
    upload_status = Column(String(20), default="pending")  # pending, processing, completed, failed
    parsed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="materials")
    contents = relationship("MaterialContent", back_populates="material", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="material")

class MaterialContent(Base):
    __tablename__ = "material_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    material_id = Column(UUID(as_uuid=True), ForeignKey("course_materials.id"), nullable=False)
    chapter_number = Column(Integer)
    chapter_title = Column(String(200))
    content_text = Column(Text)
    summary = Column(Text)
    knowledge_points = Column(JSON)  # ["知识点1", "知识点2"]
    # vector_embedding = Column(VECTOR(1536))  # For semantic search (stored in Qdrant, not in PostgreSQL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    material = relationship("CourseMaterial", back_populates="contents")
