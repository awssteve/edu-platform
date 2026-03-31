from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import random

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for questions
questions_db = {}
next_question_id = 1

class QuestionType(str):
    MULTIPLE_CHOICE = "choice"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"
    TRUE_FALSE = "true_false"

class QuestionCreate(BaseModel):
    material_id: Optional[int] = None
    course_id: Optional[int] = None
    question_type: str  # choice, fill_blank, short_answer, true_false
    question_text: str
    options: Optional[List[str]] = None  # For multiple choice
    correct_answer: str  # For all types (comma separated for multiple choice)
    explanation: Optional[str] = None
    difficulty: str = "medium"  # easy, medium, hard
    points: int = 10

class QuestionResponse(BaseModel):
    id: int
    material_id: Optional[int]
    course_id: Optional[int]
    question_type: str
    question_text: str
    options: Optional[List[str]]
    correct_answer: str
    explanation: Optional[str]
    difficulty: str
    points: int
    created_at: str

class QuestionGenerateRequest(BaseModel):
    material_id: int
    choice_count: int = 3
    fill_blank_count: int = 2
    short_answer_count: int = 1
    difficulty: str = "medium"

@router.post("/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(question: QuestionCreate):
    global next_question_id
    
    # Validate question based on type
    if question.question_type == QuestionType.MULTIPLE_CHOICE.value:
        if not question.options or len(question.options) < 2:
            raise HTTPException(status_code=400, detail="Multiple choice questions need at least 2 options")
    
    # Create new question
    new_question = {
        "id": next_question_id,
        "material_id": question.material_id,
        "course_id": question.course_id,
        "question_type": question.question_type,
        "question_text": question.question_text,
        "options": question.options,
        "correct_answer": question.correct_answer,
        "explanation": question.explanation,
        "difficulty": question.difficulty,
        "points": question.points,
        "created_at": datetime.now().isoformat()
    }
    
    questions_db[next_question_id] = new_question
    next_question_id += 1
    
    return QuestionResponse(**new_question)

@router.post("/questions/material/{material_id}/generate", status_code=status.HTTP_200_OK)
def generate_questions_from_material(
    material_id: int,
    req: QuestionGenerateRequest
):
    global next_question_id
    
    # Simple mock generation (in real implementation, this would use AI)
    generated_questions = []
    
    # Generate multiple choice questions
    for i in range(req.choice_count):
        new_question = {
            "id": next_question_id,
            "material_id": material_id,
            "question_type": QuestionType.MULTIPLE_CHOICE.value,
            "question_text": f"这是第 {i+1} 道选择题（AI 生成）",
            "options": ["选项 A", "选项 B", "选项 C", "选项 D"],
            "correct_answer": random.choice(["A", "B", "C", "D"]),
            "explanation": f"这是第 {i+1} 题的解析（AI 生成）",
            "difficulty": req.difficulty,
            "points": 10,
            "created_at": datetime.now().isoformat()
        }
        questions_db[next_question_id] = new_question
        generated_questions.append(new_question)
        next_question_id += 1
    
    # Generate fill in the blank questions
    for i in range(req.fill_blank_count):
        new_question = {
            "id": next_question_id,
            "material_id": material_id,
            "question_type": QuestionType.FILL_BLANK.value,
            "question_text": f"这是第 {i+1} 填空题（AI 生成）",
            "options": None,
            "correct_answer": f"答案 {i+1}（AI 生成）",
            "explanation": f"这是第 {i+1} 题的解析（AI 生成）",
            "difficulty": req.difficulty,
            "points": 5,
            "created_at": datetime.now().isoformat()
        }
        questions_db[next_question_id] = new_question
        generated_questions.append(new_question)
        next_question_id += 1
    
    # Generate short answer questions
    for i in range(req.short_answer_count):
        new_question = {
            "id": next_question_id,
            "material_id": material_id,
            "question_type": QuestionType.SHORT_ANSWER.value,
            "question_text": f"这是第 {i+1} 简答题（AI 生成）",
            "options": None,
            "correct_answer": f"答案 {i+1}（AI 生成）",
            "explanation": f"这是第 {i+1} 题的解析（AI 生成）",
            "difficulty": req.difficulty,
            "points": 15,
            "created_at": datetime.now().isoformat()
        }
        questions_db[next_question_id] = new_question
        generated_questions.append(new_question)
        next_question_id += 1
    
    return {
        "message": f"Successfully generated {len(generated_questions)} questions",
        "questions": generated_questions
    }

@router.get("/questions", response_model=List[QuestionResponse])
def list_questions(
    material_id: Optional[int] = None,
    course_id: Optional[int] = None,
    question_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_questions = []
    
    for q in questions_db.values():
        # Filter by material
        if material_id is not None and q["material_id"] != material_id:
            continue
        
        # Filter by course
        if course_id is not None and q["course_id"] != course_id:
            continue
        
        # Filter by question type
        if question_type is not None and q["question_type"] != question_type:
            continue
        
        # Filter by difficulty
        if difficulty is not None and q["difficulty"] != difficulty:
            continue
        
        filtered_questions.append(q)
    
    # Pagination
    filtered_questions = filtered_questions[skip:skip+limit]
    
    return filtered_questions

@router.get("/questions/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int):
    question = questions_db.get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return QuestionResponse(**question)

@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, question_update: dict):
    question = questions_db.get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Update fields
    if "question_text" in question_update:
        question["question_text"] = question_update["question_text"]
    if "options" in question_update:
        question["options"] = question_update["options"]
    if "correct_answer" in question_update:
        question["correct_answer"] = question_update["correct_answer"]
    if "explanation" in question_update:
        question["explanation"] = question_update["explanation"]
    if "difficulty" in question_update:
        question["difficulty"] = question_update["difficulty"]
    if "points" in question_update:
        question["points"] = question_update["points"]
    
    # In real implementation, update timestamp
    # question["updated_at"] = datetime.now().isoformat()
    
    return QuestionResponse(**question)

@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int):
    question = questions_db.get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    del questions_db[question_id]
    
    return None

@router.post("/questions/{question_id}/check", status_code=status.HTTP_200_OK)
def check_answer(question_id: int, user_answer: str):
    question = questions_db.get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Simple check (for multiple choice, just compare the first letter)
    correct = False
    if question["question_type"] == QuestionType.MULTIPLE_CHOICE.value:
        # For multiple choice, compare first letter of answer
        user_answer_first = user_answer[0].upper() if user_answer else ""
        correct_answer_first = question["correct_answer"][0].upper()
        correct = user_answer_first == correct_answer_first
    else:
        # For other types, exact match
        correct = user_answer.strip() == question["correct_answer"].strip()
    
    return {
        "correct": correct,
        "correct_answer": question["correct_answer"],
        "user_answer": user_answer,
        "points_earned": question["points"] if correct else 0
    }
