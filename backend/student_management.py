"""
Student Management Module (School Admin)
学生管理模块（学校管理员）
功能：学校管理员可以管理学生
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for school students
school_students_db = {}
next_school_student_id = 1

class StudentCreate(BaseModel):
    school_id: int
    username: str
    email: str
    password: str
    first_name: str
    last_name: str
    class_name: Optional[str] = None
    student_id: Optional[str] = None
    grade: Optional[str] = None
    is_active: bool = True
    created_by: int  # User ID who created this student

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    class_name: Optional[str] = None
    student_id: Optional[str] = None
    grade: Optional[str] = None
    is_active: Optional[bool] = None

class StudentResponse(BaseModel):
    id: int
    school_id: int
    user_id: Optional[int]
    username: str
    email: str
    first_name: str
    last_name: str
    full_name: str
    class_name: Optional[str]
    student_id: Optional[str]
    grade: Optional[str]
    is_active: bool
    courses_enrolled: int
    courses_completed: int
    total_study_time_hours: float
    last_login: Optional[str]
    created_at: str
    updated_at: Optional[str]

@router.post("/schools/{school_id}/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(school_id: int, student: StudentCreate):
    global next_school_student_id
    
    # Check if school exists (simple check)
    # In real implementation, validate school_id
    
    # Check if email already exists
    for s in school_students_db.values():
        if s["email"] == student.email and s["school_id"] == school_id:
            raise HTTPException(status_code=400, detail="Student with this email already exists")
    
    # Create new student
    new_student = {
        "id": next_school_student_id,
        "school_id": school_id,
        "user_id": None,  # Can be linked to user account later
        "username": student.username,
        "email": student.email,
        "password": student.password,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "full_name": f"{student.first_name} {student.last_name}",
        "class_name": student.class_name,
        "student_id": student.student_id,
        "grade": student.grade,
        "is_active": student.is_active,
        "courses_enrolled": 0,
        "courses_completed": 0,
        "total_study_time_hours": 0.0,
        "last_login": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": None
    }
    
    school_students_db[next_school_student_id] = new_student
    next_school_student_id += 1
    
    return StudentResponse(**new_student)

@router.get("/schools/{school_id}/students", response_model=List[StudentResponse])
def list_students(
    school_id: int,
    is_active: Optional[bool] = None,
    grade: Optional[str] = None,
    class_name: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_students = []
    
    for s in school_students_db.values():
        # Filter by school
        if s["school_id"] != school_id:
            continue
        
        # Filter by active status
        if is_active is not None and s["is_active"] != is_active:
            continue
        
        # Filter by grade
        if grade is not None and s["grade"] != grade:
            continue
        
        # Filter by class name
        if class_name is not None and s["class_name"] != class_name:
            continue
        
        # Filter by search (name, email, student_id)
        if search:
            search_lower = search.lower()
            if (search_lower not in s["full_name"].lower() and
                search_lower not in s["email"].lower() and
                (s["student_id"] and search_lower not in s["student_id"].lower())):
                continue
        
        filtered_students.append(s)
    
    # Sort by last login (most recent first), then by created date
    filtered_students.sort(key=lambda x: (x["last_login"] or "1970-01-01", x["created_at"]), reverse=True)
    
    # Pagination
    filtered_students = filtered_students[skip:skip+limit]
    
    return filtered_students

@router.get("/schools/{school_id}/students/{student_id}", response_model=StudentResponse)
def get_student(school_id: int, student_id: int):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return StudentResponse(**student)

@router.put("/schools/{school_id}/students/{student_id}", response_model=StudentResponse)
def update_student(school_id: int, student_id: int, student_update: StudentUpdate):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update fields
    if student_update.first_name:
        student["first_name"] = student_update.first_name
    if student_update.last_name:
        student["last_name"] = student_update.last_name
    if student_update.class_name:
        student["class_name"] = student_update.class_name
    if student_update.student_id:
        student["student_id"] = student_update.student_id
    if student_update.grade:
        student["grade"] = student_update.grade
    if student_update.is_active is not None:
        student["is_active"] = student_update.is_active
    
    # Update full name
    student["full_name"] = f"{student['first_name']} {student['last_name']}"
    student["updated_at"] = datetime.now().isoformat()
    
    return StudentResponse(**student)

@router.delete("/schools/{school_id}/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(school_id: int, student_id: int):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    del school_students_db[student_id]
    
    return None

@router.post("/schools/{school_id}/students/{student_id}/activate", response_model=StudentResponse)
def activate_student(school_id: int, student_id: int):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student["is_active"] = True
    student["updated_at"] = datetime.now().isoformat()
    
    return StudentResponse(**student)

@router.post("/schools/{school_id}/students/{student_id}/deactivate", response_model=StudentResponse)
def deactivate_student(school_id: int, student_id: int):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student["is_active"] = False
    student["updated_at"] = datetime.now().isoformat()
    
    return StudentResponse(**student)

@router.post("/schools/{school_id}/students/{student_id}/enroll-courses", status_code=status.HTTP_200_OK)
def enroll_student_courses(school_id: int, student_id: int, course_ids: List[int]):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update courses enrolled count (simplified)
    # In real implementation, this would create actual enrollments
    student["courses_enrolled"] += len(course_ids)
    student["updated_at"] = datetime.now().isoformat()
    
    return {
        "message": f"Successfully enrolled student in {len(course_ids)} courses",
        "student_id": student_id,
        "student_name": student["full_name"],
        "courses_enrolled": student["courses_enrolled"],
        "updated_at": student["updated_at"]
    }

@router.get("/schools/{school_id}/students/{student_id}/courses", status_code=status.HTTP_200_OK)
def get_student_courses(school_id: int, student_id: int):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # In real implementation, fetch actual courses
    # For now, return mock data
    return {
        "student_id": student_id,
        "student_name": student["full_name"],
        "courses_enrolled": student["courses_enrolled"],
        "courses_completed": student["courses_completed"],
        "courses": [
            {
                "course_id": 1,
                "course_name": "Python Programming",
                "enrollment_date": "2026-01-01T00:00:00Z",
                "completion_percentage": 75.5,
                "status": "active"
            },
            {
                "course_id": 2,
                "course_name": "Web Development",
                "enrollment_date": "2026-01-15T00:00:00Z",
                "completion_percentage": 45.0,
                "status": "active"
            }
        ]
    }

@router.get("/schools/{school_id}/students/{student_id}/grades", status_code=status.HTTP_200_OK)
def get_student_grades(school_id: int, student_id: int):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # In real implementation, fetch actual grades
    # For now, return mock data
    return {
        "student_id": student_id,
        "student_name": student["full_name"],
        "total_assignments": 20,
        "completed_assignments": 18,
        "average_grade": 85.5,
        "grades": [
            {
                "course_id": 1,
                "course_name": "Python Programming",
                "assignment_id": 1,
                "assignment_title": "Assignment 1",
                "score": 85,
                "max_score": 100,
                "percentage": 85.0,
                "graded_at": "2026-03-29T10:00:00Z"
            },
            {
                "course_id": 1,
                "course_name": "Python Programming",
                "assignment_id": 2,
                "assignment_title": "Assignment 2",
                "score": 92,
                "max_score": 100,
                "percentage": 92.0,
                "graded_at": "2026-03-29T12:00:00Z"
            }
        ]
    }

@router.get("/schools/{school_id}/students/{student_id}/progress", status_code=status.HTTP_200_OK)
def get_student_progress(school_id: int, student_id: int):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate progress
    if student["courses_enrolled"] > 0:
        completion_rate = round((student["courses_completed"] / student["courses_enrolled"]) * 100, 2)
    else:
        completion_rate = 0.0
    
    return {
        "student_id": student_id,
        "student_name": student["full_name"],
        "courses_enrolled": student["courses_enrolled"],
        "courses_completed": student["courses_completed"],
        "completion_rate": completion_rate,
        "total_study_time_hours": student["total_study_time_hours"],
        "last_login": student["last_login"]
    }

@router.post("/schools/{school_id}/students/bulk-import", status_code=status.HTTP_201_CREATED)
def bulk_import_students(school_id: int, students: List[dict], created_by: int):
    global next_school_student_id
    
    imported_students = []
    failed_students = []
    
    for student_data in students:
        try:
            # Validate required fields
            if not student_data.get("email") or not student_data.get("first_name") or not student_data.get("last_name"):
                failed_students.append({
                    "data": student_data,
                    "error": "Missing required fields (email, first_name, last_name)"
                })
                continue
            
            # Create student
            new_student = {
                "id": next_school_student_id,
                "school_id": school_id,
                "user_id": None,
                "username": student_data.get("username", f"student_{next_school_student_id}"),
                "email": student_data["email"],
                "password": student_data.get("password", "default123"),  # Default password
                "first_name": student_data["first_name"],
                "last_name": student_data["last_name"],
                "full_name": f"{student_data.get('first_name')} {student_data.get('last_name')}",
                "class_name": student_data.get("class_name"),
                "student_id": student_data.get("student_id"),
                "grade": student_data.get("grade"),
                "is_active": True,
                "courses_enrolled": 0,
                "courses_completed": 0,
                "total_study_time_hours": 0.0,
                "last_login": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": None,
                "created_by": created_by
            }
            
            school_students_db[next_school_student_id] = new_student
            imported_students.append(StudentResponse(**new_student))
            next_school_student_id += 1
        
        except Exception as e:
            failed_students.append({
                "data": student_data,
                "error": str(e)
            })
    
    return {
        "message": f"Imported {len(imported_students)} students successfully",
        "total_students": len(students),
        "imported_count": len(imported_students),
        "failed_count": len(failed_students),
        "imported_students": imported_students,
        "failed_students": failed_students
    }

@router.get("/schools/{school_id}/students/summary", status_code=status.HTTP_200_OK)
def get_students_summary(school_id: int):
    total_students = 0
    active_students = 0
    inactive_students = 0
    
    students_by_grade = {}
    students_by_class = {}
    
    for s in school_students_db.values():
        if s["school_id"] != school_id:
            continue
        
        total_students += 1
        
        if s["is_active"]:
            active_students += 1
        else:
            inactive_students += 1
        
        # Count by grade
        grade = s.get("grade", "Other")
        if grade not in students_by_grade:
            students_by_grade[grade] = 0
        students_by_grade[grade] += 1
        
        # Count by class
        class_name = s.get("class_name", "No Class")
        if class_name not in students_by_class:
            students_by_class[class_name] = 0
        students_by_class[class_name] += 1
    
    return {
        "school_id": school_id,
        "total_students": total_students,
        "active_students": active_students,
        "inactive_students": inactive_students,
        "students_by_grade": students_by_grade,
        "students_by_class": students_by_class,
        "total_grades": len(students_by_grade),
        "total_classes": len(students_by_class)
    }

@router.get("/schools/{school_id}/students/{student_id}/activity", status_code=status.HTTP_200_OK)
def get_student_activity(school_id: int, student_id: int, date_from: Optional[str] = None, date_to: Optional[str] = None):
    student = school_students_db.get(student_id)
    if not student or student["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # In real implementation, fetch actual activity
    # For now, return mock data
    return {
        "student_id": student_id,
        "student_name": student["full_name"],
        "activities": [
            {
                "type": "login",
                "description": "Logged in from Chrome",
                "timestamp": "2026-03-29T10:30:00Z"
            },
            {
                "type": "course_access",
                "description": "Accessed Python Programming course",
                "timestamp": "2026-03-29T11:00:00Z"
            },
            {
                "type": "assignment_submit",
                "description": "Submitted Assignment 1",
                "timestamp": "2026-03-29T12:00:00Z"
            },
            {
                "type": "course_progress",
                "description": "Completed 5% of Python Programming course",
                "timestamp": "2026-03-29T13:30:00Z"
            }
        ],
        "total_activities": 4
    }

@router.delete("/schools/{school_id}/students/bulk-delete", status_code=status.HTTP_200_OK)
def bulk_delete_students(school_id: int, student_ids: List[int]):
    deleted_count = 0
    failed_count = 0
    
    for student_id in student_ids:
        student = school_students_db.get(student_id)
        if student and student["school_id"] == school_id:
            del school_students_db[student_id]
            deleted_count += 1
        else:
            failed_count += 1
    
    return {
        "message": f"Deleted {deleted_count} students",
        "total_requested": len(student_ids),
        "deleted_count": deleted_count,
        "failed_count": failed_count
    }
