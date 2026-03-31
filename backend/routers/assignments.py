from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime
from database import get_db
from models import User, Assignment, StudentSubmission, Question
from schemas import SubmissionCreate, SubmissionResponse
from .auth import get_current_user

router = APIRouter()

@router.post("/{assignment_id}/submit", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: UUID,
    submission: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit assignments"
        )
    
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    
    if not assignment.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment is not published yet"
        )
    
    # Check if already submitted (if multiple attempts not allowed)
    if not assignment.allow_multiple_attempts:
        existing = db.query(StudentSubmission).filter(
            StudentSubmission.assignment_id == assignment_id,
            StudentSubmission.student_id == current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted this assignment"
            )
    
    db_submission = StudentSubmission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        answers=submission.answers
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Auto-grade (simplified)
    auto_grade_submission(db_submission, db)
    
    return db_submission

def auto_grade_submission(submission: StudentSubmission, db: Session):
    """Auto-grade submission (simplified version)"""
    assignment = db.query(Assignment).filter(
        Assignment.id == submission.assignment_id
    ).first()
    
    total_score = 0
    correct_count = 0
    total_count = len(assignment.questions)
    feedback = {}
    
    for question in assignment.questions:
        qid = str(question.id)
        student_answer = submission.answers.get(qid)
        
        if question.type == "choice":
            is_correct = student_answer == question.correct_answer
            if is_correct:
                correct_count += 1
            feedback[qid] = {
                "correct": is_correct,
                "your_answer": student_answer,
                "correct_answer": question.correct_answer
            }
        elif question.type == "fill_blank":
            is_correct = student_answer == question.correct_answer
            if is_correct:
                correct_count += 1
            feedback[qid] = {
                "correct": is_correct,
                "your_answer": student_answer
            }
        else:
            # For short_answer and essay, would use AI grading
            feedback[qid] = {
                "status": "pending_manual_grading"
            }
    
    # Calculate score
    if total_count > 0:
        total_score = (correct_count / total_count) * 100
    
    submission.ai_score = total_score
    submission.score = total_score
    submission.feedback = feedback
    submission.graded_at = datetime.utcnow()
    
    db.commit()

@router.get("/assignment/{assignment_id}/submissions", response_model=List[SubmissionResponse])
def get_assignment_submissions(
    assignment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    
    # Teachers can see all submissions, students only their own
    if current_user.role == "teacher" or current_user.role == "admin":
        submissions = db.query(StudentSubmission).filter(
            StudentSubmission.assignment_id == assignment_id
        ).all()
    else:
        submissions = db.query(StudentSubmission).filter(
            StudentSubmission.assignment_id == assignment_id,
            StudentSubmission.student_id == current_user.id
        ).all()
    
    return submissions

@router.get("/my/submissions", response_model=List[SubmissionResponse])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submissions = db.query(StudentSubmission).filter(
        StudentSubmission.student_id == current_user.id
    ).all()
    return submissions

@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submission = db.query(StudentSubmission).filter(
        StudentSubmission.id == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    
    # Check permission
    if current_user.role != "admin":
        if submission.student_id != current_user.id:
            assignment = db.query(Assignment).filter(
                Assignment.id == submission.assignment_id
            ).first()
            if assignment.teacher_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
    
    return submission
