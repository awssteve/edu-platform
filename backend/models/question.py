from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, ARRAY, Numeric, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import enum
import uuid
from database import Base

class QuestionType(str, enum.Enum):
    CHOICE = "choice"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"
    EXPERIMENT = "experiment"

class Difficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    material_id = Column(UUID(as_uuid=True), ForeignKey("course_materials.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    type = Column(String(20), nullable=False)  # QuestionType
    question_text = Column(Text, nullable=False)
    options = Column(JSON)  # For choice questions: ["A. 选项1", "B. 选项2"]
    correct_answer = Column(Text)
    reference_answer = Column(Text)
    difficulty = Column(String(10))  # Difficulty
    knowledge_point = Column(String(200))
    ai_generated = Column(Boolean, default=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    material = relationship("CourseMaterial", back_populates="questions")
    verified_by_user = relationship("User")
    assignment_questions = relationship("Assignment", secondary="assignment_questions", back_populates="questions")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    allow_multiple_attempts = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="assignments")
    teacher = relationship("User")
    questions = relationship("Question", secondary="assignment_questions", back_populates="assignment_questions")
    submissions = relationship("StudentSubmission", back_populates="assignment")

# Association table for many-to-many relationship
from sqlalchemy import Table
assignment_questions = Table(
    'assignment_questions', Base.metadata,
    Column('assignment_id', UUID(as_uuid=True), ForeignKey('assignments.id'), primary_key=True),
    Column('question_id', UUID(as_uuid=True), ForeignKey('questions.id'), primary_key=True)
)

class StudentSubmission(Base):
    __tablename__ = "student_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    answers = Column(JSON, nullable=False)  # {"question_id": "student_answer"}
    score = Column(Numeric(5, 2))
    ai_score = Column(Numeric(5, 2))
    manual_score = Column(Numeric(5, 2))
    feedback = Column(JSON)  # AI generated feedback
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    graded_at = Column(DateTime(timezone=True))

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    experiment_logs = relationship("ExperimentLog", back_populates="submission")

class ExperimentLog(Base):
    __tablename__ = "experiment_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("student_submissions.id"), nullable=False)
    step_number = Column(Integer)
    action = Column(String(100))
    parameters = Column(JSON)
    result = Column(JSON)
    is_correct = Column(Boolean)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submission = relationship("StudentSubmission", back_populates="experiment_logs")
