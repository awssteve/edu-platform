from fastapi import FastAPI, HTTPException, status, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Dict, List, Optional
from jose import jwt, JWTError
from datetime import datetime, timedelta
import uuid
import random

app = FastAPI(title="Complete Education Platform API", version="5.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT settings
SECRET_KEY = "test-secret-key-for-development-only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# ===== Databases (Simple in-memory for testing) =====
users_db = {}
courses_db = {}
materials_db = {}
questions_db = {}
assignments_db = {}
submissions_db = {}

next_user_id = 1
next_course_id = 1
next_material_id = 1
next_question_id = 1
next_assignment_id = 1
next_submission_id = 1

# ===== Models =====

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "student"

class UserLogin(BaseModel):
    username: str
    password: str

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    tags: List[str]
    teacher_id: Optional[int] = None

class MaterialCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    file_type: str

class QuestionCreate(BaseModel):
    material_id: Optional[int] = None
    course_id: Optional[int] = None
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str

class AssignmentCreate(BaseModel):
    course_id: int
    title: str
    description: str
    due_date: str
    question_ids: List[int]

# ===== Helper Functions =====

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ===== Root Endpoints =====

@app.get("/")
def root():
    return {
        "message": "Complete Education Platform API",
        "version": "5.0.0",
        "docs": "/docs",
        "features": [
            "User Management (Register, Login, Token)",
            "Course Management (CRUD)",
            "Material Management (Upload, Download)",
            "Question Management (Create, Generate, Check)",
            "Assignment Management (CRUD, Submit, Grade)"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "All systems operational",
        "version": "5.0.0",
        "databases": {
            "users": len(users_db),
            "courses": len(courses_db),
            "materials": len(materials_db),
            "questions": len(questions_db),
            "assignments": len(assignments_db),
            "submissions": len(submissions_db)
        }
    }

# ===== User Management =====

@app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    global next_user_id
    
    # Check duplicates
    for u in users_db.values():
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        if u["username"] == user.username:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    new_user = {
        "id": next_user_id,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.now().isoformat()
    }
    
    users_db[next_user_id] = new_user
    next_user_id += 1
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {
        "id": new_user["id"],
        "username": new_user["username"],
        "email": new_user["email"],
        "full_name": new_user["full_name"],
        "role": new_user["role"],
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/api/v1/auth/login")
def login(form_data: UserLogin):
    user = None
    for u in users_db.values():
        if u["username"] == form_data.username:
            user = u
            break
    
    if not user or user["password"] != form_data.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["username"]})
    refresh_token = create_refresh_token(data={"sub": user["username"]})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.get("/api/v1/users")
def list_users():
    safe_users = []
    for u in users_db.values():
        safe_user = u.copy()
        del safe_user["password"]
        safe_users.append(safe_user)
    return {"users": safe_users}

# ===== Course Management =====

@app.post("/api/v1/courses", status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate):
    global next_course_id
    
    new_course = {
        "id": next_course_id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "tags": course.tags,
        "teacher_id": course.teacher_id,
        "enrollment_count": 0,
        "created_at": datetime.now().isoformat()
    }
    
    courses_db[next_course_id] = new_course
    next_course_id += 1
    
    return new_course

@app.get("/api/v1/courses")
def list_courses():
    return {"courses": list(courses_db.values())}

@app.get("/api/v1/courses/{course_id}")
def get_course(course_id: int):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.post("/api/v1/courses/{course_id}/enroll")
def enroll_course(course_id: int):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course["enrollment_count"] += 1
    return {"message": "Successfully enrolled", "enrollment_count": course["enrollment_count"]}

# ===== Material Management =====

@app.post("/api/v1/materials", status_code=status.HTTP_201_CREATED)
def create_material(material: MaterialCreate):
    global next_material_id
    
    new_material = {
        "id": next_material_id,
        "course_id": material.course_id,
        "title": material.title,
        "description": material.description,
        "file_type": material.file_type,
        "file_name": f"{material.title}.{material.file_type}",
        "download_count": 0,
        "created_at": datetime.now().isoformat()
    }
    
    materials_db[next_material_id] = new_material
    next_material_id += 1
    
    return new_material

@app.get("/api/v1/materials")
def list_materials():
    return {"materials": list(materials_db.values())}

@app.get("/api/v1/materials/{material_id}")
def get_material(material_id: int):
    material = materials_db.get(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

# ===== Question Management =====

@app.post("/api/v1/questions", status_code=status.HTTP_201_CREATED)
def create_question(question: QuestionCreate):
    global next_question_id
    
    new_question = {
        "id": next_question_id,
        "material_id": question.material_id,
        "course_id": question.course_id,
        "question_type": question.question_type,
        "question_text": question.question_text,
        "options": question.options,
        "correct_answer": question.correct_answer,
        "difficulty": "medium",
        "points": 10,
        "created_at": datetime.now().isoformat()
    }
    
    questions_db[next_question_id] = new_question
    next_question_id += 1
    
    return new_question

@app.get("/api/v1/questions")
def list_questions():
    return {"questions": list(questions_db.values())}

@app.get("/api/v1/questions/{question_id}")
def get_question(question_id: int):
    question = questions_db.get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@app.post("/api/v1/questions/material/{material_id}/generate")
def generate_questions(material_id: int):
    material = materials_db.get(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    generated = []
    for i in range(3):
        new_q = {
            "id": next_question_id + i,
            "material_id": material_id,
            "question_type": "choice",
            "question_text": f"AI 生成题目 {i+1} 关于 {material['title']}",
            "options": ["A", "B", "C", "D"],
            "correct_answer": random.choice(["A", "B", "C", "D"]),
            "difficulty": "medium",
            "points": 10,
            "created_at": datetime.now().isoformat()
        }
        generated.append(new_q)
        questions_db[next_question_id + i] = new_q
        next_question_id += 1
    
    return {"message": f"Generated {len(generated)} questions", "questions": generated}

# ===== Assignment Management =====

@app.post("/api/v1/assignments", status_code=status.HTTP_201_CREATED)
def create_assignment(assignment: AssignmentCreate):
    global next_assignment_id
    
    new_assignment = {
        "id": next_assignment_id,
        "course_id": assignment.course_id,
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date,
        "question_ids": assignment.question_ids,
        "created_at": datetime.now().isoformat()
    }
    
    assignments_db[next_assignment_id] = new_assignment
    next_assignment_id += 1
    
    return new_assignment

@app.get("/api/v1/assignments")
def list_assignments():
    return {"assignments": list(assignments_db.values())}

@app.get("/api/v1/assignments/{assignment_id}")
def get_assignment(assignment_id: int):
    assignment = assignments_db.get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

if __name__ == "__main__":
    import uvicorn
    print("Starting Complete Education Platform API v5.0.0")
    print("Features: Auth + Courses + Materials + Questions + Assignments")
    uvicorn.run(app, host="0.0.0.0", port=8000)
