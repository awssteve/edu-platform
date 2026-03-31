"""
Learning Progress Tracking Module
学习进度跟踪模块
功能：记录学生学习进度、学习时长、完成度
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for learning progress
learning_progress_db = {}
next_progress_id = 1

# Simple database for learning records
learning_records_db = {}
next_record_id = 1

class LearningProgressCreate(BaseModel):
    student_id: int
    course_id: int
    material_id: Optional[int] = None
    completed_pages: int = 0
    total_pages: Optional[int] = None
    last_position: Optional[int] = None
    completed: bool = False

class LearningProgressResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    material_id: Optional[int]
    completed_pages: int
    total_pages: Optional[int]
    last_position: Optional[int]
    completed: bool
    completion_percentage: float
    updated_at: str

class LearningRecordCreate(BaseModel):
    student_id: int
    course_id: int
    material_id: Optional[int] = None
    study_duration_minutes: int = 0
    pages_studied: int = 0
    notes: Optional[str] = None

class LearningRecordResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    material_id: Optional[int]
    study_duration_minutes: int
    pages_studied: int
    notes: Optional[str]
    recorded_at: str

@router.post("/learning/progress", response_model=LearningProgressResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_progress(progress: LearningProgressCreate):
    global next_progress_id
    
    # Simple check - in real implementation, validate student and course exist
    
    # Create or update progress
    new_progress = {
        "id": next_progress_id,
        "student_id": progress.student_id,
        "course_id": progress.course_id,
        "material_id": progress.material_id,
        "completed_pages": progress.completed_pages,
        "total_pages": progress.total_pages,
        "last_position": progress.last_position,
        "completed": progress.completed,
        "updated_at": datetime.now().isoformat()
    }
    
    # Calculate completion percentage
    if progress.total_pages and progress.total_pages > 0:
        new_progress["completion_percentage"] = round((progress.completed_pages / progress.total_pages) * 100, 2)
    else:
        new_progress["completion_percentage"] = 0.0
    
    learning_progress_db[next_progress_id] = new_progress
    next_progress_id += 1
    
    return LearningProgressResponse(**new_progress)

@router.get("/learning/progress", response_model=List[LearningProgressResponse])
def list_progress(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    completed: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_progress = []
    
    for p in learning_progress_db.values():
        # Filter by student
        if student_id is not None and p["student_id"] != student_id:
            continue
        
        # Filter by course
        if course_id is not None and p["course_id"] != course_id:
            continue
        
        # Filter by completion status
        if completed is not None and p["completed"] != completed:
            continue
        
        filtered_progress.append(p)
    
    # Pagination
    filtered_progress = filtered_progress[skip:skip+limit]
    
    return filtered_progress

@router.get("/learning/progress/student/{student_id}/course/{course_id}", response_model=LearningProgressResponse)
def get_progress(student_id: int, course_id: int):
    # Find progress by student and course
    for p in learning_progress_db.values():
        if p["student_id"] == student_id and p["course_id"] == course_id:
            return LearningProgressResponse(**p)
    
    # If not found, return default
    raise HTTPException(status_code=404, detail="Learning progress not found")

@router.put("/learning/progress/{progress_id}", response_model=LearningProgressResponse)
def update_progress(progress_id: int, progress_update: dict):
    progress = learning_progress_db.get(progress_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Learning progress not found")
    
    # Update fields
    if "completed_pages" in progress_update:
        progress["completed_pages"] = progress_update["completed_pages"]
    if "total_pages" in progress_update:
        progress["total_pages"] = progress_update["total_pages"]
    if "last_position" in progress_update:
        progress["last_position"] = progress_update["last_position"]
    if "completed" in progress_update:
        progress["completed"] = progress_update["completed"]
    
    progress["updated_at"] = datetime.now().isoformat()
    
    # Recalculate completion percentage
    if progress["total_pages"] and progress["total_pages"] > 0:
        progress["completion_percentage"] = round((progress["completed_pages"] / progress["total_pages"]) * 100, 2)
    
    return LearningProgressResponse(**progress)

# ===== Learning Records =====

@router.post("/learning/records", response_model=LearningRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(record: LearningRecordCreate):
    global next_record_id
    
    new_record = {
        "id": next_record_id,
        "student_id": record.student_id,
        "course_id": record.course_id,
        "material_id": record.material_id,
        "study_duration_minutes": record.study_duration_minutes,
        "pages_studied": record.pages_studied,
        "notes": record.notes,
        "recorded_at": datetime.now().isoformat()
    }
    
    learning_records_db[next_record_id] = new_record
    next_record_id += 1
    
    return LearningRecordResponse(**new_record)

@router.get("/learning/records", response_model=List[LearningRecordResponse])
def list_records(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_records = []
    
    for r in learning_records_db.values():
        # Filter by student
        if student_id is not None and r["student_id"] != student_id:
            continue
        
        # Filter by course
        if course_id is not None and r["course_id"] != course_id:
            continue
        
        # Filter by date range (simple check)
        if date_from and r["recorded_at"] < date_from:
            continue
        if date_to and r["recorded_at"] > date_to:
            continue
        
        filtered_records.append(r)
    
    # Sort by date (newest first)
    filtered_records.sort(key=lambda x: x["recorded_at"], reverse=True)
    
    # Pagination
    filtered_records = filtered_records[skip:skip+limit]
    
    return filtered_records

@router.get("/learning/records/summary", status_code=status.HTTP_200_OK)
def get_records_summary(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None
):
    total_records = 0
    total_duration_minutes = 0
    total_pages = 0
    
    for r in learning_records_db.values():
        # Filter by student
        if student_id is not None and r["student_id"] != student_id:
            continue
        
        # Filter by course
        if course_id is not None and r["course_id"] != course_id:
            continue
        
        total_records += 1
        total_duration_minutes += r["study_duration_minutes"]
        total_pages += r["pages_studied"]
    
    # Calculate hours
    total_duration_hours = round(total_duration_minutes / 60, 2)
    
    return {
        "total_records": total_records,
        "total_duration_minutes": total_duration_minutes,
        "total_duration_hours": total_duration_hours,
        "total_pages": total_pages
    }

@router.get("/learning/progress/summary", status_code=status.HTTP_200_OK)
def get_progress_summary(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None
):
    total_courses = 0
    completed_courses = 0
    total_pages = 0
    completed_pages = 0
    average_completion = 0.0
    
    # Get unique courses
    course_ids = set()
    for p in learning_progress_db.values():
        if student_id is not None and p["student_id"] != student_id:
            continue
        if course_id is not None and p["course_id"] != course_id:
            continue
        
        course_ids.add(p["course_id"])
        total_pages += p["total_pages"] if p["total_pages"] else 0
        completed_pages += p["completed_pages"]
        
        if p["completed"]:
            completed_courses += 1
    
    total_courses = len(course_ids)
    
    # Calculate average completion
    if total_pages > 0:
        average_completion = round((completed_pages / total_pages) * 100, 2)
    
    return {
        "student_id": student_id,
        "total_courses": total_courses,
        "completed_courses": completed_courses,
        "total_pages": total_pages,
        "completed_pages": completed_pages,
        "average_completion_percentage": average_completion
    }
