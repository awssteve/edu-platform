from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from sqlalchemy import func
from database import get_db
from models import User, Course, CourseAnalytics, KnowledgePointMastery, LearningRecord
from .auth import get_current_user

router = APIRouter()

@router.get("/courses/{course_id}/overview", response_model=dict)
def get_course_overview(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    # Total students
    total_students = db.query(LearningRecord).filter(
        LearningRecord.course_id == course_id
    ).count()
    
    # Completed students
    completed_students = db.query(LearningRecord).filter(
        LearningRecord.course_id == course_id,
        LearningRecord.status == "completed"
    ).count()
    
    # Completion rate
    completion_rate = (completed_students / total_students * 100) if total_students > 0 else 0
    
    # Average study time
    avg_study_time = db.query(func.avg(LearningRecord.total_study_time_minutes)).filter(
        LearningRecord.course_id == course_id
    ).scalar() or 0
    
    return {
        "total_students": total_students,
        "completed_students": completed_students,
        "completion_rate": round(completion_rate, 2),
        "avg_study_time_hours": round(avg_study_time / 60, 1)
    }

@router.get("/student/{student_id}/course/{course_id}/progress", response_model=dict)
def get_student_progress(
    student_id: UUID,
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check permission
    if current_user.id != student_id and current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    learning_record = db.query(LearningRecord).filter(
        LearningRecord.student_id == student_id,
        LearningRecord.course_id == course_id
    ).first()
    
    if not learning_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning record not found"
        )
    
    return {
        "total_study_time_minutes": learning_record.total_study_time_minutes,
        "total_assignments_completed": learning_record.total_assignments_completed,
        "total_assignments_count": learning_record.total_assignments_count,
        "final_score": learning_record.final_score,
        "status": learning_record.status,
        "enrollment_date": learning_record.enrollment_date,
        "completion_date": learning_record.completion_date
    }

@router.get("/knowledge-mastery/{student_id}/{course_id}", response_model=List[dict])
def get_knowledge_mastery(
    student_id: UUID,
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check permission
    if current_user.id != student_id and current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    mastery_list = db.query(KnowledgePointMastery).filter(
        KnowledgePointMastery.student_id == student_id,
        KnowledgePointMastery.course_id == course_id
    ).all()
    
    return [
        {
            "knowledge_point": m.knowledge_point,
            "attempt_count": m.attempt_count,
            "correct_count": m.correct_count,
            "mastery_rate": float(m.mastery_rate) if m.mastery_rate else 0,
            "last_practiced_at": m.last_practiced_at
        }
        for m in mastery_list
    ]

@router.get("/ranking/{course_id}", response_model=List[dict])
def get_course_ranking(
    course_id: UUID,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all learning records for the course
    records = db.query(LearningRecord).join(
        User, LearningRecord.student_id == User.id
    ).filter(
        LearningRecord.course_id == course_id,
        LearningRecord.status.in_(["in_progress", "completed"])
    ).order_by(
        LearningRecord.final_score.desc(),
        LearningRecord.total_study_time_minutes.desc()
    ).limit(limit).all()
    
    return [
        {
            "rank": idx + 1,
            "student_name": r.student.full_name,
            "final_score": float(r.final_score) if r.final_score else 0,
            "total_study_time_minutes": r.total_study_time_minutes,
            "status": r.status
        }
        for idx, r in enumerate(records)
    ]
