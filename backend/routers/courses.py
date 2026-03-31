from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from database import get_db
from models import User, Course, CourseMaterial, School, LearningRecord
from schemas import CourseCreate, CourseUpdate, CourseResponse
from .auth import get_current_user

router = APIRouter()

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create courses"
        )
    
    # Get school from teacher
    from models.user import SchoolTeacher
    teacher_school = db.query(SchoolTeacher).filter(
        SchoolTeacher.user_id == current_user.id
    ).first()
    
    school_id = teacher_school.school_id if teacher_school else None
    
    db_course = Course(
        school_id=school_id,
        teacher_id=current_user.id,
        **course.dict()
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/", response_model=List[CourseResponse])
def get_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course).filter(Course.is_published == True)
    
    if category:
        query = query.filter(Course.category == category)
    
    if search:
        query = query.filter(
            Course.title.ilike(f"%{search}%") | 
            Course.description.ilike(f"%{search}%")
        )
    
    courses = query.options(joinedload(Course.teacher)).offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: UUID, db: Session = Depends(get_db)):
    course = db.query(Course).options(joinedload(Course.teacher)).filter(
        Course.id == course_id
    ).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: UUID,
    course_update: CourseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if course.teacher_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the course creator or admin can update this course"
        )
    
    update_data = course_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if course.teacher_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the course creator or admin can delete this course"
        )
    
    db.delete(course)
    db.commit()
    return None

@router.post("/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll_course(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can enroll in courses"
        )
    
    # Check if already enrolled
    existing = db.query(LearningRecord).filter(
        LearningRecord.student_id == current_user.id,
        LearningRecord.course_id == course_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    from datetime import date
    learning_record = LearningRecord(
        student_id=current_user.id,
        course_id=course_id,
        enrollment_date=date.today(),
        status="enrolled"
    )
    db.add(learning_record)
    db.commit()
    return {"message": "Successfully enrolled"}
