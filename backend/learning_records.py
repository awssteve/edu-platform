"""
Learning Records Module
学习记录模块
功能：完整的学习历史、证书记录、学习时间统计
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for learning history records
learning_history_db = {}
next_history_id = 1

class LearningHistoryRecord(BaseModel):
    id: int
    student_id: int
    course_id: int
    action_type: str  # enrollment, material_view, material_download, assignment_submit, assignment_grade
    action_detail: str
    duration_minutes: Optional[int] = None
    score: Optional[float] = None
    created_at: str

class LearningHistoryResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    action_type: str
    action_detail: str
    duration_minutes: Optional[int]
    score: Optional[float]
    created_at: str

class LearningStatsResponse(BaseModel):
    student_id: int
    total_courses_enrolled: int
    total_courses_completed: int
    total_study_time_hours: float
    total_assignments: int
    average_score: float
    total_certificates: int
    last_activity: Optional[str]

@router.post("/learning-history", response_model=LearningHistoryRecord, status_code=status.HTTP_201_CREATED)
def create_learning_history(record: LearningHistoryRecord):
    global next_history_id
    
    new_record = {
        "id": next_history_id,
        "student_id": record.student_id,
        "course_id": record.course_id,
        "action_type": record.action_type,
        "action_detail": record.action_detail,
        "duration_minutes": record.duration_minutes,
        "score": record.score,
        "created_at": datetime.now().isoformat()
    }
    
    learning_history_db[next_history_id] = new_record
    next_history_id += 1
    
    return LearningHistoryRecord(**new_record)

@router.get("/learning-history", response_model=List[LearningHistoryRecord])
def list_learning_history(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    action_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_records = []
    
    for r in learning_history_db.values():
        # Filter by student
        if student_id is not None and r["student_id"] != student_id:
            continue
        
        # Filter by course
        if course_id is not None and r["course_id"] != course_id:
            continue
        
        # Filter by action type
        if action_type is not None and r["action_type"] != action_type:
            continue
        
        # Filter by date range
        if date_from and r["created_at"] < date_from:
            continue
        if date_to and r["created_at"] > date_to:
            continue
        
        filtered_records.append(r)
    
    # Sort by created date (newest first)
    filtered_records.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    filtered_records = filtered_records[skip:skip+limit]
    
    return filtered_records

@router.get("/learning-history/{record_id}", response_model=LearningHistoryRecord)
def get_learning_history_record(record_id: int):
    record = learning_history_db.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Learning history record not found")
    
    return LearningHistoryRecord(**record)

@router.get("/learning-history/student/{student_id}/stats", response_model=LearningStatsResponse)
def get_student_stats(student_id: int):
    # Calculate student statistics
    enrolled_courses = set()
    completed_courses = set()
    total_study_time_minutes = 0
    total_assignments = 0
    assignment_scores = []
    
    for r in learning_history_db.values():
        if r["student_id"] != student_id:
            continue
        
        if r["action_type"] == "enrollment":
            enrolled_courses.add(r["course_id"])
        
        if r["action_type"] == "completion":
            completed_courses.add(r["course_id"])
        
        if r["duration_minutes"]:
            total_study_time_minutes += r["duration_minutes"]
        
        if r["action_type"] == "assignment_grade":
            total_assignments += 1
            if r["score"]:
                assignment_scores.append(r["score"])
    
    # Calculate average score
    if assignment_scores:
        average_score = round(sum(assignment_scores) / len(assignment_scores), 2)
    else:
        average_score = 0.0
    
    # Calculate total study time in hours
    total_study_time_hours = round(total_study_time_minutes / 60, 2)
    
    # Get last activity
    last_activity = None
    for r in sorted(learning_history_db.values(), key=lambda x: x["created_at"], reverse=True):
        if r["student_id"] == student_id:
            last_activity = r["created_at"]
            break
    
    # Mock certificate count (in real implementation, fetch from certificate database)
    total_certificates = len([r for r in learning_history_db.values() 
                               if r["student_id"] == student_id and r["action_type"] == "completion"])
    
    return LearningStatsResponse(
        student_id=student_id,
        total_courses_enrolled=len(enrolled_courses),
        total_courses_completed=len(completed_courses),
        total_study_time_hours=total_study_time_hours,
        total_assignments=total_assignments,
        average_score=average_score,
        total_certificates=total_certificates,
        last_activity=last_activity
    )

@router.get("/learning-history/student/{student_id}/timeline", response_model=List[LearningHistoryRecord])
def get_student_timeline(student_id: int):
    # Get all history records for student
    records = []
    for r in learning_history_db.values():
        if r["student_id"] == student_id:
            records.append(r)
    
    # Sort by created date (oldest first for timeline)
    records.sort(key=lambda x: x["created_at"])
    
    return records

@router.delete("/learning-history/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learning_history_record(record_id: int):
    record = learning_history_db.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Learning history record not found")
    
    del learning_history_db[record_id]
    
    return None

@router.post("/learning-history/batch", status_code=status.HTTP_201_CREATED)
def create_batch_learning_history(records: List[Dict]):
    global next_history_id
    
    created_records = []
    
    for record_data in records:
        new_record = {
            "id": next_history_id,
            "student_id": record_data.get("student_id"),
            "course_id": record_data.get("course_id"),
            "action_type": record_data.get("action_type"),
            "action_detail": record_data.get("action_detail", ""),
            "duration_minutes": record_data.get("duration_minutes"),
            "score": record_data.get("score"),
            "created_at": datetime.now().isoformat()
        }
        
        learning_history_db[next_history_id] = new_record
        created_records.append(LearningHistoryRecord(**new_record))
        next_history_id += 1
    
    return {
        "message": f"Successfully created {len(created_records)} learning history records",
        "records": created_records
    }

@router.get("/learning-history/student/{student_id}/daily", status_code=status.HTTP_200_OK)
def get_daily_learning_history(student_id: int):
    # Get daily summary of learning activities
    daily_summary = {}
    
    for r in learning_history_db.values():
        if r["student_id"] != student_id:
            continue
        
        # Get date (YYYY-MM-DD)
        date = r["created_at"][:10]
        
        if date not in daily_summary:
            daily_summary[date] = {
                "date": date,
                "total_actions": 0,
                "total_study_time_minutes": 0,
                "assignments_submitted": 0,
                "courses_enrolled": 0
            }
        
        daily_summary[date]["total_actions"] += 1
        
        if r["duration_minutes"]:
            daily_summary[date]["total_study_time_minutes"] += r["duration_minutes"]
        
        if r["action_type"] == "assignment_submit":
            daily_summary[date]["assignments_submitted"] += 1
        
        if r["action_type"] == "enrollment":
            daily_summary[date]["courses_enrolled"] += 1
    
    # Sort by date (newest first)
    sorted_summary = sorted(daily_summary.values(), key=lambda x: x["date"], reverse=True)
    
    return sorted_summary

@router.get("/learning-history/student/{student_id}/export", status_code=status.HTTP_200_OK)
def export_learning_history(student_id: int):
    # Export learning history to CSV format (text for now)
    export_data = "ID,Student ID,Course ID,Action Type,Action Detail,Duration Minutes,Score,Created At\n"
    
    for r in learning_history_db.values():
        if r["student_id"] != student_id:
            continue
        
        export_data += f"{r['id']},{r['student_id']},{r['course_id']},{r['action_type']},{r['action_detail']},{r['duration_minutes']},{r['score']},{r['created_at']}\n"
    
    from fastapi.responses import Response
    
    return Response(
        content=export_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=learning_history_student_{student_id}.csv"
        }
    )
