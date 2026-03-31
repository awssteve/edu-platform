from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    cover_url: Optional[str] = None
    tags: Optional[List[str]] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    cover_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None

class CourseResponse(BaseModel):
    id: UUID
    school_id: Optional[UUID]
    teacher_id: UUID
    title: str
    description: Optional[str]
    category: Optional[str]
    cover_url: Optional[str]
    is_published: bool
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MaterialCreate(BaseModel):
    title: str
    file_type: str
    file_url: str
    file_size: Optional[int] = None

class MaterialResponse(BaseModel):
    id: UUID
    course_id: UUID
    title: str
    file_name: str
    file_url: str
    file_type: str
    file_size: Optional[int]
    pages: Optional[int]
    upload_status: str
    parsed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
