"""
Assignment Submission Module
学生提交作业模块
功能：学生提交作业答案、教师批改作业
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for assignments
assignments_db = {}

# Simple database for submissions (student answers)
submissions_db = {}
next_submission_id = 1

# Simple database for grading (teacher grades)
grades_db = {}
next_grade_id = 1

class SubmissionCreate(BaseModel):
    assignment_id: int
    student_id: int
    answers: Dict[int, str]  # question_id -> answer

class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    answers: Dict[int, str]
    submitted_at: str
    graded: bool = False
    grade: Optional[int] = None
    grade_comment: Optional[str] = None

class GradeCreate(BaseModel):
    submission_id: int
    teacher_id: int
    score: int  # 0-100
    comment: Optional[str] = None

class GradeResponse(BaseModel):
    id: int
    submission_id: int
    teacher_id: int
    score: int
    comment: Optional[str]
    graded_at: str

@router.post("/assignments/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assignment(submission: SubmissionCreate):
    global next_submission_id
    
    # Check if assignment exists
    assignment = assignments_db.get(submission.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if assignment is past due date
    # In real implementation, compare with due_date
    
    # Create new submission
    new_submission = {
        "id": next_submission_id,
        "assignment_id": submission.assignment_id,
        "student_id": submission.student_id,
        "answers": submission.answers,
        "submitted_at": datetime.now().isoformat(),
        "graded": False,
        "grade": None,
        "grade_comment": None
    }
    
    submissions_db[next_submission_id] = new_submission
    next_submission_id += 1
    
    return SubmissionResponse(**new_submission)

@router.get("/assignments/submissions")
def list_submissions(
    assignment_id: Optional[int] = None,
    student_id: Optional[int] = None,
    graded: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_submissions = []
    
    for s in submissions_db.values():
        # Filter by assignment
        if assignment_id is not None and s["assignment_id"] != assignment_id:
            continue
        
        # Filter by student
        if student_id is not None and s["student_id"] != student_id:
            continue
        
        # Filter by graded status
        if graded is not None and s["graded"] != graded:
            continue
        
        filtered_submissions.append(s)
    
    # Sort by submitted date (newest first)
    filtered_submissions.sort(key=lambda x: x["submitted_at"], reverse=True)
    
    # Pagination
    filtered_submissions = filtered_submissions[skip:skip+limit]
    
    return {"submissions": filtered_submissions}

@router.get("/assignments/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(submission_id: int):
    submission = submissions_db.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return SubmissionResponse(**submission)

@router.post("/assignments/submissions/{submission_id}/grade", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
def grade_submission(submission_id: int, grade: GradeCreate):
    global next_grade_id
    
    # Check if submission exists
    submission = submissions_db.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check if already graded
    if submission["graded"]:
        raise HTTPException(status_code=400, detail="Submission already graded")
    
    # Create grade
    new_grade = {
        "id": next_grade_id,
        "submission_id": submission_id,
        "teacher_id": grade.teacher_id,
        "score": grade.score,
        "comment": grade.comment,
        "graded_at": datetime.now().isoformat()
    }
    
    grades_db[next_grade_id] = new_grade
    next_grade_id += 1
    
    # Update submission with grade
    submission["graded"] = True
    submission["grade"] = grade.score
    submission["grade_comment"] = grade.comment
    
    return GradeResponse(**new_grade)

@router.get("/assignments/submissions/{submission_id}/grade")
def get_submission_grade(submission_id: int):
    submission = submissions_db.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if not submission["graded"]:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    # Find grade for this submission
    for g in grades_db.values():
        if g["submission_id"] == submission_id:
            return GradeResponse(**g)
    
    raise HTTPException(status_code=404, detail="Grade not found")

@router.get("/assignments/{assignment_id}/submissions", response_model=List[SubmissionResponse])
def get_assignment_submissions(assignment_id: int):
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get all submissions for this assignment
    submissions = []
    for s in submissions_db.values():
        if s["assignment_id"] == assignment_id:
            submissions.append(s)
    
    # Sort by submitted date (newest first)
    submissions.sort(key=lambda x: x["submitted_at"], reverse=True)
    
    return submissions

@router.get("/assignments/student/{student_id}/submissions", response_model=List[SubmissionResponse])
def get_student_submissions(student_id: int):
    # Get all submissions for this student
    submissions = []
    for s in submissions_db.values():
        if s["student_id"] == student_id:
            submissions.append(s)
    
    # Sort by submitted date (newest first)
    submissions.sort(key=lambda x: x["submitted_at"], reverse=True)
    
    return submissions

@router.get("/assignments/student/{student_id}/grades", response_model=List[Dict])
def get_student_grades(student_id: int):
    # Get all grades for this student
    student_grades = []
    
    for s in submissions_db.values():
        if s["student_id"] != student_id:
            continue
        
        if s["graded"]:
            for g in grades_db.values():
                if g["submission_id"] == s["id"]:
                    assignment = assignments_db.get(s["assignment_id"])
                    student_grades.append({
                        "assignment_id": s["assignment_id"],
                        "assignment_title": assignment["title"] if assignment else "Unknown",
                        "submission_id": s["id"],
                        "score": g["score"],
                        "comment": g["comment"],
                        "graded_at": g["graded_at"],
                        "submitted_at": s["submitted_at"]
                    })
                    break
    
    # Sort by graded date (newest first)
    student_grades.sort(key=lambda x: x["graded_at"], reverse=True)
    
    return student_grades

@router.get("/assignments/submissions/summary", status_code=status.HTTP_200_OK)
def get_submissions_summary():
    total_submissions = len(submissions_db)
    graded_submissions = len([s for s in submissions_db.values() if s["graded"]])
    pending_submissions = total_submissions - graded_submissions
    
    return {
        "total_submissions": total_submissions,
        "graded_submissions": graded_submissions,
        "pending_submissions": pending_submissions,
        "average_score": round(sum(g["score"] for g in grades_db.values()) / len(grades_db), 2) if grades_db else 0.0
    }
