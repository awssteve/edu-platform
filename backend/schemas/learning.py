from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class LearningProgressResponse(BaseModel):
    id: UUID
    student_id: UUID
    course_id: UUID
    material_id: Optional[UUID]
    completed_pages: int
    total_pages: Optional[int]
    last_position: Optional[datetime]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LearningAnalyticsResponse(BaseModel):
    id: UUID
    student_id: UUID
    course_id: UUID
    total_study_time_minutes: int
    correct_rate: Optional[float]
    weak_points: Optional[List[str]]
    recommendations: Optional[List[str]]
    report_date: str
    created_at: datetime

    class Config:
        from_attributes = True
