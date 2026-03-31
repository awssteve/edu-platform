from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class QuestionCreate(BaseModel):
    type: str  # choice, fill_blank, short_answer, essay, experiment
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    reference_answer: Optional[str] = None
    difficulty: Optional[str] = None  # easy, medium, hard
    knowledge_point: Optional[str] = None

class QuestionResponse(BaseModel):
    id: UUID
    material_id: Optional[UUID]
    course_id: UUID
    type: str
    question_text: str
    options: Optional[List[str]]
    correct_answer: Optional[str]
    reference_answer: Optional[str]
    difficulty: Optional[str]
    knowledge_point: Optional[str]
    ai_generated: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    question_ids: List[UUID]
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    allow_multiple_attempts: bool = False

class AssignmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    teacher_id: UUID
    title: str
    description: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration_minutes: Optional[int]
    allow_multiple_attempts: bool
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    answers: dict  # {"question_id": "student_answer"}

class SubmissionResponse(BaseModel):
    id: UUID
    assignment_id: UUID
    student_id: UUID
    answers: dict
    score: Optional[float]
    ai_score: Optional[float]
    manual_score: Optional[float]
    feedback: Optional[dict]
    submitted_at: datetime
    graded_at: Optional[datetime]

    class Config:
        from_attributes = True
