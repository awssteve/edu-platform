from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Dict, List, Optional
from jose import jwt, JWTError
from datetime import datetime, timedelta
import simple_auth as auth_module
import simple_courses as courses_module
import simple_materials as materials_module
import simple_questions as questions_module
import simple_assignments as assignments_module

app = FastAPI(title="Simple Education API", version="4.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_module.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(courses_module.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(materials_module.router, prefix="/api/v1/materials", tags=["Materials"])
app.include_router(questions_module.router, prefix="/api/v1/questions", tags=["Questions"])
app.include_router(assignments_module.router, prefix="/api/v1/assignments", tags=["Assignments"])

# Health check
class HealthResponse(BaseModel):
    status: str
    message: str
    users_count: int
    courses_count: int
    materials_count: int
    questions_count: int
    assignments_count: int
    version: str

@app.get("/", response_model=Dict[str, str])
def root():
    return {
        "message": "Simple Education API",
        "version": "4.0.0",
        "docs": "/docs",
        "features": [
            "--- Authentication ---",
            "User Registration",
            "User Login",
            "Token Refresh",
            "Get Current User",
            "List All Users",
            "--- Course Management ---",
            "Create Course",
            "List Courses",
            "Get Course Details",
            "Update Course",
            "Delete Course",
            "Enroll in Course",
            "--- Material Management ---",
            "Upload Material",
            "List Materials",
            "Get Material Details",
            "Update Material",
            "Delete Material",
            "Download Material",
            "--- Question Management ---",
            "Create Question",
            "Generate Questions from Material",
            "List Questions",
            "Get Question Details",
            "Update Question",
            "Delete Question",
            "Check Answer",
            "--- Assignment Management ---",
            "Create Assignment",
            "List Assignments",
            "Get Assignment Details",
            "Get Assignment Questions",
            "Update Assignment",
            "Delete Assignment",
            "Submit Assignment",
            "Grade Submission"
        ]
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running with all features",
        users_count=len(auth_module.users_list),
        courses_count=len(courses_module.courses_db),
        materials_count=len(materials_module.materials_db),
        questions_count=len(questions_module.questions_db),
        assignments_count=len(assignments_module.assignments_db),
        version="4.0.0"
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting simple education server v4.0.0 on http://0.0.0.0:8000")
    print("Features: Auth + Courses + Materials + Questions + Assignments")
    print("All core functionality implemented!")
    uvicorn.run(app, host="0.0.0.0", port=8000)
