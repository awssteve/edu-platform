from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for assignments
assignments_db = {}
next_assignment_id = 1

# Simple database for submissions
submissions_db = {}
next_submission_id = 1

class AssignmentCreate(BaseModel):
    course_id: int
    title: str
    description: str
    due_date: str  # ISO format datetime
    max_points: int = 100
    question_ids: List[int]

class AssignmentResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: str
    due_date: str
    max_points: int
    question_count: int
    created_at: str

class SubmissionCreate(BaseModel):
    assignment_id: int
    student_id: int
    answers: Dict[int, str]  # question_id -> answer

class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    answers: Dict[int, str]
    score: int
    max_score: int
    submitted_at: str
    graded: bool

@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(assignment: AssignmentCreate):
    global next_assignment_id
    
    # Simple validation
    if not assignment.title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    if not assignment.due_date:
        raise HTTPException(status_code=400, detail="Due date is required")
    
    # Create new assignment
    new_assignment = {
        "id": next_assignment_id,
        "course_id": assignment.course_id,
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date,
        "max_points": assignment.max_points,
        "question_ids": assignment.question_ids,
        "question_count": len(assignment.question_ids),
        "created_at": datetime.now().isoformat()
    }
    
    assignments_db[next_assignment_id] = new_assignment
    next_assignment_id += 1
    
    return AssignmentResponse(**new_assignment)

@router.get("/assignments", response_model=List[AssignmentResponse])
def list_assignments(
    course_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_assignments = []
    
    for a in assignments_db.values():
        # Filter by course
        if course_id is not None and a["course_id"] != course_id:
            continue
        
        filtered_assignments.append(a)
    
    # Sort by created date (newest first)
    filtered_assignments.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    filtered_assignments = filtered_assignments[skip:skip+limit]
    
    return filtered_assignments

@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(assignment_id: int):
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    return AssignmentResponse(**assignment)

@router.get("/assignments/{assignment_id}/questions", response_model=List[int])
def get_assignment_questions(assignment_id: int):
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    return assignment["question_ids"]

@router.put("/assignments/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(assignment_id: int, assignment_update: dict):
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Update fields
    if "title" in assignment_update:
        assignment["title"] = assignment_update["title"]
    if "description" in assignment_update:
        assignment["description"] = assignment_update["description"]
    if "due_date" in assignment_update:
        assignment["due_date"] = assignment_update["due_date"]
    if "max_points" in assignment_update:
        assignment["max_points"] = assignment_update["max_points"]
    if "question_ids" in assignment_update:
        assignment["question_ids"] = assignment_update["question_ids"]
        assignment["question_count"] = len(assignment_update["question_ids"])
    
    return AssignmentResponse(**assignment)

@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(assignment_id: int):
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    del assignments_db[assignment_id]
    
    return None

# ===== Submission Management =====

@router.post("/assignments/{assignment_id}/submit", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assignment(assignment_id: int, submission: SubmissionCreate):
    global next_submission_id
    
    # Check if assignment exists
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Create new submission
    new_submission = {
        "id": next_submission_id,
        "assignment_id": assignment_id,
        "student_id": submission.student_id,
        "answers": submission.answers,
        "score": 0,  # Will be calculated when graded
        "max_score": assignment["max_points"],
        "submitted_at": datetime.now().isoformat(),
        "graded": False
    }
    
    submissions_db[next_submission_id] = new_submission
    next_submission_id += 1
    
    return SubmissionResponse(**new_submission)

@router.get("/assignments/{assignment_id}/submissions", response_model=List[SubmissionResponse])
def get_assignment_submissions(assignment_id: int):
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    filtered_submissions = []
    for s in submissions_db.values():
        if s["assignment_id"] == assignment_id:
            filtered_submissions.append(s)
    
    return filtered_submissions

@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(submission_id: int):
    submission = submissions_db.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return SubmissionResponse(**submission)

@router.post("/submissions/{submission_id}/grade", response_model=SubmissionResponse)
def grade_submission(submission_id: int):
    submission = submissions_db.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Get assignment
    assignment = assignments_db.get(submission["assignment_id"])
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Simple grading (compare answers)
    correct_count = 0
    total_questions = len(assignment["question_ids"])
    
    for question_id in assignment["question_ids"]:
        user_answer = submission["answers"].get(question_id, "")
        
        # Simple check (just count non-empty answers)
        if user_answer.strip():
            correct_count += 1
    
    # Calculate score
    if total_questions > 0:
        score = int((correct_count / total_questions) * assignment["max_points"])
    else:
        score = 0
    
    # Update submission
    submission["score"] = score
    submission["graded"] = True
    
    return SubmissionResponse(**submission)

@router.get("/students/{student_id}/submissions", response_model=List[SubmissionResponse])
def get_student_submissions(student_id: int):
    filtered_submissions = []
    for s in submissions_db.values():
        if s["student_id"] == student_id:
            filtered_submissions.append(s)
    
    return filtered_submissions
