"""
Question Checking Module
题目检查答案模块
功能：学生可以检查答案是否正确，获得即时反馈
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for questions
questions_db = {}

# Simple database for answer checks
answer_checks_db = {}
next_check_id = 1

class AnswerCheckRequest(BaseModel):
    question_id: int
    user_answer: str
    student_id: Optional[int] = None

class AnswerCheckResponse(BaseModel):
    id: int
    question_id: int
    student_id: Optional[int]
    user_answer: str
    correct_answer: str
    is_correct: bool
    points_earned: int
    points_possible: int
    explanation: Optional[str]
    checked_at: str

class BatchAnswerCheckRequest(BaseModel):
    question_id: int
    user_answer: str
    student_id: Optional[int] = None
    check_count: int  # Number of attempts before revealing answer

@router.post("/questions/check", response_model=AnswerCheckResponse, status_code=status.HTTP_200_OK)
def check_answer(request: AnswerCheckRequest):
    global next_check_id
    
    # Find question
    question = questions_db.get(request.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Get question details
    question_type = question.get("question_type")
    correct_answer = question.get("correct_answer", "")
    options = question.get("options", [])
    points_possible = question.get("points", 10)
    
    # Check answer based on question type
    is_correct = False
    explanation = None
    
    if question_type == "choice":
        # Multiple choice: compare first letter
        user_answer_first = request.user_answer.strip().upper()[0] if request.user_answer.strip() else ""
        correct_answer_first = correct_answer.strip().upper()[0] if correct_answer.strip() else ""
        is_correct = user_answer_first == correct_answer_first
        
        # Add explanation
        correct_option_text = options[ord(correct_answer_first) - ord('A')] if options and len(options) > 0 else ""
        explanation = f"正确答案是：{correct_answer_first} ({correct_option_text})"
    
    elif question_type == "fill_blank":
        # Fill in the blank: exact match (case insensitive)
        is_correct = request.user_answer.strip().lower() == correct_answer.strip().lower()
        explanation = f"正确答案是：{correct_answer}"
    
    elif question_type == "short_answer":
        # Short answer: exact match (case insensitive, but trim)
        is_correct = request.user_answer.strip().lower() == correct_answer.strip().lower()
        explanation = f"正确答案是：{correct_answer}"
    
    elif question_type == "true_false":
        # True/false: parse answer
        user_answer_clean = request.user_answer.strip().lower()
        if user_answer_clean in ["true", "t", "yes", "y", "1"]:
            user_bool = True
        elif user_answer_clean in ["false", "f", "no", "n", "0"]:
            user_bool = False
        else:
            user_bool = None
        
        correct_answer_clean = correct_answer.strip().lower()
        if correct_answer_clean in ["true", "t", "yes", "y", "1"]:
            correct_bool = True
        elif correct_answer_clean in ["false", 'f', "no", "n", "0"]:
            correct_bool = False
        else:
            correct_bool = None
        
        if user_bool is not None and correct_bool is not None:
            is_correct = user_bool == correct_bool
            explanation = f"正确答案是：{correct_answer_bool}"
        else:
            is_correct = False
            explanation = "请选择 'True' 或 'False'"
    
    else:
        # Default: exact match
        is_correct = request.user_answer.strip() == correct_answer.strip()
        explanation = f"正确答案是：{correct_answer}"
    
    # Calculate points earned
    points_earned = points_possible if is_correct else 0
    
    # Create answer check record
    new_check = {
        "id": next_check_id,
        "question_id": request.question_id,
        "student_id": request.student_id,
        "user_answer": request.user_answer,
        "correct_answer": correct_answer,
        "is_correct": is_correct,
        "points_earned": points_earned,
        "points_possible": points_possible,
        "explanation": explanation,
        "checked_at": datetime.now().isoformat()
    }
    
    answer_checks_db[next_check_id] = new_check
    next_check_id += 1
    
    return AnswerCheckResponse(**new_check)

@router.post("/questions/batch-check", status_code=status.HTTP_200_OK)
def batch_check_answers(requests: List[AnswerCheckRequest]):
    results = []
    correct_count = 0
    total_points = 0
    
    for req in requests:
        global next_check_id
        
        # Find question
        question = questions_db.get(req.question_id)
        if not question:
            continue
        
        # Check answer
        correct_answer = question.get("correct_answer", "")
        question_type = question.get("question_type")
        points_possible = question.get("points", 10)
        
        # Simple check
        is_correct = False
        if question_type == "choice":
            user_answer_first = req.user_answer.strip().upper()[0] if req.user_answer.strip() else ""
            correct_answer_first = correct_answer.strip().upper()[0] if correct_answer.strip() else ""
            is_correct = user_answer_first == correct_answer_first
        else:
            is_correct = req.user_answer.strip() == correct_answer.strip()
        
        points_earned = points_possible if is_correct else 0
        if is_correct:
            correct_count += 1
            total_points += points_earned
        
        # Create check record
        new_check = {
            "id": next_check_id,
            "question_id": req.question_id,
            "student_id": req.student_id,
            "user_answer": req.user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "points_earned": points_earned,
            "points_possible": points_possible,
            "explanation": f"正确答案是：{correct_answer}" if not is_correct else None,
            "checked_at": datetime.now().isoformat()
        }
        
        answer_checks_db[next_check_id] = new_check
        next_check_id += 1
        results.append(new_check)
    
    return {
        "total_questions": len(requests),
        "correct_count": correct_count,
        "incorrect_count": len(requests) - correct_count,
        "total_points_earned": total_points,
        "total_points_possible": sum(q.get("points", 10) for q in [questions_db.get(r.question_id) for r in requests] if q]),
        "results": results
    }

@router.get("/questions/{question_id}/hint", status_code=status.HTTP_200_OK)
def get_question_hint(question_id: int):
    question = questions_db.get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Generate hint based on question type
    question_type = question.get("question_type", "choice")
    correct_answer = question.get("correct_answer", "")
    
    hint = ""
    
    if question_type == "choice":
        # Hint for multiple choice
        options = question.get("options", [])
        if options and len(options) > 0:
            correct_answer_first = correct_answer.strip().upper()[0] if correct_answer.strip() else ""
            if correct_answer_first in ['A', 'B', 'C', 'D']:
                hint = f"答案是 {correct_answer_first} 开头的选项"
            else:
                hint = "请选择最佳答案"
    
    elif question_type == "fill_blank":
        # Hint for fill in the blank
        if len(correct_answer) > 3:
            hint = f"答案的前 {len(correct_answer) // 2} 个字符是：{correct_answer[:len(correct_answer) // 2]}***"
        else:
            hint = "答案是一个单词"
    
    elif question_type == "short_answer":
        # Hint for short answer
        if len(correct_answer) > 2:
            hint = f"答案长度：{len(correct_answer)} 个字符"
        else:
            hint = "答案是一个短语"
    
    return {
        "question_id": question_id,
        "question_type": question_type,
        "hint": hint
    }

@router.get("/questions/checks/summary", status_code=status.HTTP_200_OK)
def get_answer_checks_summary(
    student_id: Optional[int] = None,
    question_id: Optional[int] = None
):
    filtered_checks = []
    
    for c in answer_checks_db.values():
        # Filter by student
        if student_id is not None and c["student_id"] != student_id:
            continue
        
        # Filter by question
        if question_id is not None and c["question_id"] != question_id:
            continue
        
        filtered_checks.append(c)
    
    total_checks = len(filtered_checks)
    correct_checks = len([c for c in filtered_checks if c["is_correct"]])
    incorrect_checks = total_checks - correct_checks
    
    total_points_possible = sum(c["points_possible"] for c in filtered_checks)
    total_points_earned = sum(c["points_earned"] for c in filtered_checks)
    
    accuracy = round((correct_checks / total_checks) * 100, 2) if total_checks > 0 else 0.0
    score_percentage = round((total_points_earned / total_points_possible) * 100, 2) if total_points_possible > 0 else 0.0
    
    return {
        "total_checks": total_checks,
        "correct_checks": correct_checks,
        "incorrect_checks": incorrect_checks,
        "total_points_earned": total_points_earned,
        "total_points_possible": total_points_possible,
        "accuracy": accuracy,
        "score_percentage": score_percentage
    }

@router.get("/questions/student/{student_id}/progress", status_code=status.HTTP_200_OK)
def get_student_question_progress(student_id: int):
    # Get all checks for this student
    student_checks = []
    for c in answer_checks_db.values():
        if c["student_id"] == student_id:
            student_checks.append(c)
    
    # Get unique questions checked
    unique_questions = set(c["question_id"] for c in student_checks)
    
    # Calculate progress for each question
    question_progress = {}
    for q_id in unique_questions:
        checks = [c for c in student_checks if c["question_id"] == q_id]
        correct_count = len([c for c in checks if c["is_correct"]])
        
        if checks:
            is_mastered = correct_count >= 2  # Mastered if correct twice
            question_progress[q_id] = {
                "question_id": q_id,
                "total_attempts": len(checks),
                "correct_attempts": correct_count,
                "is_mastered": is_mastered,
                "accuracy": round((correct_count / len(checks)) * 100, 2)
            }
    
    return {
        "student_id": student_id,
        "total_questions_checked": len(unique_questions),
        "mastered_questions": len([q for q in question_progress.values() if q["is_mastered"]]),
        "overall_accuracy": round((len([c for c in student_checks if c["is_correct"]]) / len(student_checks)) * 100, 2) if student_checks else 0.0,
        "question_progress": list(question_progress.values())
    }
