from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from database import get_db
from models import User, Course, CourseMaterial, Question, Assignment
from schemas import QuestionCreate, QuestionResponse, AssignmentCreate, AssignmentResponse
from .auth import get_current_user

router = APIRouter()

@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    question: QuestionCreate,
    material_id: UUID = None,
    course_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not material_id and not course_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either material_id or course_id must be provided"
        )
    
    db_question = Question(
        material_id=material_id,
        course_id=course_id,
        **question.dict(),
        ai_generated=False  # Manually created
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/material/{material_id}", response_model=List[QuestionResponse])
def get_material_questions(
    material_id: UUID,
    db: Session = Depends(get_db)
):
    questions = db.query(Question).filter(
        Question.material_id == material_id,
        Question.is_active == True
    ).all()
    return questions

@router.post("/material/{material_id}/generate", response_model=List[QuestionResponse])
async def generate_questions(
    material_id: UUID,
    choice_count: int = 5,
    fill_blank_count: int = 3,
    short_answer_count: int = 2,
    difficulty: str = "mixed",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate questions using AI"""
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == material_id
    ).first()
    
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    
    # In production, call AI service to generate questions
    # For now, return mock questions
    
    mock_questions = []
    
    # Generate choice questions
    for i in range(choice_count):
        question = Question(
            material_id=material_id,
            course_id=material.course_id,
            type="choice",
            question_text=f"选择题 {i+1}：以下关于课程内容的描述，哪个是正确的？",
            options=[
                "A. 选项1",
                "B. 选项2", 
                "C. 选项3",
                "D. 选项4"
            ],
            correct_answer="A",
            difficulty=difficulty if difficulty != "mixed" else ["easy", "medium", "hard"][i % 3],
            ai_generated=True,
            is_active=True
        )
        db.add(question)
        mock_questions.append(question)
    
    # Generate fill_blank questions
    for i in range(fill_blank_count):
        question = Question(
            material_id=material_id,
            course_id=material.course_id,
            type="fill_blank",
            question_text=f"填空题 {i+1}：课程中的核心概念是______。",
            correct_answer="答案",
            difficulty=difficulty if difficulty != "mixed" else ["easy", "medium", "hard"][i % 3],
            ai_generated=True,
            is_active=True
        )
        db.add(question)
        mock_questions.append(question)
    
    # Generate short answer questions
    for i in range(short_answer_count):
        question = Question(
            material_id=material_id,
            course_id=material.course_id,
            type="short_answer",
            question_text=f"简答题 {i+1}：请简述本课程的主要内容。",
            reference_answer="参考答案：本课程主要讲述了...",
            difficulty=difficulty if difficulty != "mixed" else ["easy", "medium", "hard"][i % 3],
            ai_generated=True,
            is_active=True
        )
        db.add(question)
        mock_questions.append(question)
    
    db.commit()
    return mock_questions

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: UUID, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: UUID,
    question_update: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    
    update_data = question_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)
    
    db.commit()
    db.refresh(question)
    return question

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    
    # Soft delete
    question.is_active = False
    db.commit()
    return None

# Assignment endpoints
@router.post("/assignments/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    assignment: AssignmentCreate,
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
            detail="Only the course teacher can create assignments"
        )
    
    db_assignment = Assignment(
        course_id=course_id,
        teacher_id=current_user.id,
        **assignment.dict()
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    
    # Link questions
    for qid in assignment.question_ids:
        # Check if question exists
        q = db.query(Question).filter(Question.id == qid).first()
        if q:
            db_assignment.questions.append(q)
    
    db.commit()
    return db_assignment

@router.get("/assignments/course/{course_id}", response_model=List[AssignmentResponse])
def get_course_assignments(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    assignments = db.query(Assignment).filter(
        Assignment.course_id == course_id,
        Assignment.is_published == True
    ).all()
    return assignments

@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(assignment_id: UUID, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return assignment
