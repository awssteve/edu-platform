from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime
from database import get_db
from models import User, Course, CourseMaterial, LearningProgress, LearningAnalytics
from schemas import LearningProgressResponse, LearningAnalyticsResponse
from .auth import get_current_user

router = APIRouter()

@router.post("/progress", response_model=LearningProgressResponse, status_code=status.HTTP_201_CREATED)
def update_progress(
    course_id: UUID,
    material_id: UUID,
    completed_pages: int,
    total_pages: int,
    completed: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create or update progress
    progress = db.query(LearningProgress).filter(
        LearningProgress.student_id == current_user.id,
        LearningProgress.course_id == course_id,
        LearningProgress.material_id == material_id
    ).first()
    
    if not progress:
        progress = LearningProgress(
            student_id=current_user.id,
            course_id=course_id,
            material_id=material_id
        )
        db.add(progress)
    
    progress.completed_pages = completed_pages
    progress.total_pages = total_pages
    progress.completed = completed
    progress.last_position = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    return progress

@router.get("/progress/course/{course_id}", response_model=List[LearningProgressResponse])
def get_course_progress(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress_list = db.query(LearningProgress).filter(
        LearningProgress.student_id == current_user.id,
        LearningProgress.course_id == course_id
    ).all()
    return progress_list

@router.get("/progress/material/{material_id}", response_model=LearningProgressResponse)
def get_material_progress(
    material_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress = db.query(LearningProgress).filter(
        LearningProgress.student_id == current_user.id,
        LearningProgress.material_id == material_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found"
        )
    
    return progress

@router.get("/analytics/{course_id}", response_model=LearningAnalyticsResponse)
def get_learning_analytics(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analytics = db.query(LearningAnalytics).filter(
        LearningAnalytics.student_id == current_user.id,
        LearningAnalytics.course_id == course_id
    ).first()
    
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analytics not found"
        )
    
    return analytics
