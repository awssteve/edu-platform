"""
Teacher Management Module (School Admin)
教师管理模块（学校管理员）
功能：学校管理员可以管理教师
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for teachers
school_teachers_db = {}
next_teacher_id = 1

class TeacherInviteCreate(BaseModel):
    school_id: int
    email: str
    first_name: str
    last_name: str
    department: Optional[str] = None
    position: Optional[str] = None
    invited_by: int  # User ID who sent invite

class TeacherCreate(BaseModel):
    school_id: int
    username: str
    email: str
    password: str
    first_name: str
    last_name: str
    department: Optional[str] = None
    position: Optional[str] = None
    is_active: bool = True
    created_by: int  # User ID who created

class TeacherUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    is_active: Optional[bool] = None

class TeacherResponse(BaseModel):
    id: int
    school_id: int
    user_id: Optional[int]  # If user account exists
    username: Optional[str]
    email: str
    first_name: str
    last_name: str
    full_name: str
    department: Optional[str]
    position: Optional[str]
    is_active: bool
    courses_taught: int
    total_students: int
    created_at: str
    updated_at: Optional[str]

@router.post("/schools/{school_id}/teachers", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(school_id: int, teacher: TeacherCreate):
    global next_teacher_id
    
    # Check if school exists (simple check)
    # In real implementation, validate school_id
    
    # Check if email already exists
    for t in school_teachers_db.values():
        if t["email"] == teacher.email and t["school_id"] == school_id:
            raise HTTPException(status_code=400, detail="Teacher with this email already exists in school")
    
    # Create teacher
    new_teacher = {
        "id": next_teacher_id,
        "school_id": school_id,
        "user_id": None,  # Can be linked to user account later
        "username": teacher.username,
        "email": teacher.email,
        "password": teacher.password,  # For simple testing only
        "first_name": teacher.first_name,
        "last_name": teacher.last_name,
        "full_name": f"{teacher.first_name} {teacher.last_name}",
        "department": teacher.department,
        "position": teacher.position,
        "is_active": teacher.is_active,
        "courses_taught": 0,
        "total_students": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": None
    }
    
    school_teachers_db[next_teacher_id] = new_teacher
    next_teacher_id += 1
    
    return TeacherResponse(**new_teacher)

@router.post("/schools/{school_id}/teachers/invite", status_code=status.HTTP_202_ACCEPTED)
def invite_teacher(school_id: int, invite: TeacherInviteCreate):
    global next_teacher_id
    
    # Check if email already exists
    for t in school_teachers_db.values():
        if t["email"] == invite.email and t["school_id"] == school_id:
            raise HTTPException(status_code=400, detail="Teacher with this email already exists")
    
    # Create teacher invite (pending status)
    new_teacher = {
        "id": next_teacher_id,
        "school_id": school_id,
        "user_id": None,
        "username": None,
        "email": invite.email,
        "password": None,
        "first_name": invite.first_name,
        "last_name": invite.last_name,
        "full_name": f"{invite.first_name} {invite.last_name}",
        "department": invite.department,
        "position": invite.position,
        "is_active": False,
        "courses_taught": 0,
        "total_students": 0,
        "invite_token": f"invite_{next_teacher_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "invited_by": invite.invited_by,
        "invited_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "updated_at": None
    }
    
    school_teachers_db[next_teacher_id] = new_teacher
    next_teacher_id += 1
    
    # In real implementation, send invitation email
    invite_link = f"http://localhost:3000/accept-teacher-invite/{new_teacher['invite_token']}"
    
    return {
        "message": "Teacher invitation sent successfully",
        "teacher_id": new_teacher["id"],
        "email": new_teacher["email"],
        "invite_link": invite_link,  # Only for demo/testing
        "invited_at": new_teacher["invited_at"]
    }

@router.get("/schools/{school_id}/teachers", response_model=List[TeacherResponse])
def list_teachers(
    school_id: int,
    is_active: Optional[bool] = None,
    department: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_teachers = []
    
    for t in school_teachers_db.values():
        # Filter by school
        if t["school_id"] != school_id:
            continue
        
        # Filter by active status
        if is_active is not None and t["is_active"] != is_active:
            continue
        
        # Filter by department
        if department is not None and t["department"] != department:
            continue
        
        filtered_teachers.append(t)
    
    # Sort by created date (newest first)
    filtered_teachers.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    filtered_teachers = filtered_teachers[skip:skip+limit]
    
    return filtered_teachers

@router.get("/schools/{school_id}/teachers/{teacher_id}", response_model=TeacherResponse)
def get_teacher(school_id: int, teacher_id: int):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher or teacher["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    return TeacherResponse(**teacher)

@router.put("/schools/{school_id}/teachers/{teacher_id}", response_model=TeacherResponse)
def update_teacher(school_id: int, teacher_id: int, teacher_update: TeacherUpdate):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher or teacher["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Update fields
    if teacher_update.first_name:
        teacher["first_name"] = teacher_update.first_name
    if teacher_update.last_name:
        teacher["last_name"] = teacher_update.last_name
    if teacher_update.department:
        teacher["department"] = teacher_update.department
    if teacher_update.position:
        teacher["position"] = teacher_update.position
    if teacher_update.is_active is not None:
        teacher["is_active"] = teacher_update.is_active
    
    # Update full name
    teacher["full_name"] = f"{teacher['first_name']} {teacher['last_name']}"
    teacher["updated_at"] = datetime.now().isoformat()
    
    return TeacherResponse(**teacher)

@router.delete("/schools/{school_id}/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(school_id: int, teacher_id: int):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher or teacher["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    del school_teachers_db[teacher_id]
    
    return None

@router.post("/schools/{school_id}/teachers/{teacher_id}/activate", response_model=TeacherResponse)
def activate_teacher(school_id: int, teacher_id: int):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher or teacher["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    teacher["is_active"] = True
    teacher["updated_at"] = datetime.now().isoformat()
    
    return TeacherResponse(**teacher)

@router.post("/schools/{school_id}/teachers/{teacher_id}/deactivate", response_model=TeacherResponse)
def deactivate_teacher(school_id: int, teacher_id: int):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher or teacher["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    teacher["is_active"] = False
    teacher["updated_at"] = datetime.now().isoformat()
    
    return TeacherResponse(**teacher)

@router.get("/schools/{school_id}/teachers/{teacher_id}/courses", status_code=status.HTTP_200_OK)
def get_teacher_courses(school_id: int, teacher_id: int):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher or teacher["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # In real implementation, fetch courses taught by this teacher
    # For now, return mock data
    return {
        "teacher_id": teacher_id,
        "teacher_name": teacher["full_name"],
        "courses_taught": teacher["courses_taught"],
        "courses": [
            {
                "course_id": 1,
                "course_name": "Python Programming",
                "enrollment_count": 150,
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "course_id": 2,
                "course_name": "Web Development",
                "enrollment_count": 200,
                "created_at": "2026-01-01T00:00:00Z"
            }
        ]
    }

@router.get("/schools/{school_id}/teachers/{teacher_id}/students", status_code=status.HTTP_200_OK)
def get_teacher_students(school_id: int, teacher_id: int):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher or teacher["school_id"] != school_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # In real implementation, fetch students enrolled in this teacher's courses
    # For now, return mock data
    return {
        "teacher_id": teacher_id,
        "teacher_name": teacher["full_name"],
        "total_students": teacher["total_students"],
        "students": [
            {
                "student_id": 1,
                "student_name": "John Doe",
                "email": "john@example.com",
                "enrolled_courses": 2,
                "last_active": "2026-03-29T10:30:00Z"
            },
            {
                "student_id": 2,
                "student_name": "Jane Smith",
                "email": "jane@example.com",
                "enrolled_courses": 3,
                "last_active": "2026-03-29T09:45:00Z"
            }
        ]
    }

@router.get("/schools/{school_id}/teachers/summary", status_code=status.HTTP_200_OK)
def get_teachers_summary(school_id: int):
    total_teachers = 0
    active_teachers = 0
    inactive_teachers = 0
    teachers_by_department = {}
    
    for t in school_teachers_db.values():
        if t["school_id"] != school_id:
            continue
        
        total_teachers += 1
        
        if t["is_active"]:
            active_teachers += 1
        else:
            inactive_teachers += 1
        
        # Count by department
        dept = t.get("department", "Other")
        if dept not in teachers_by_department:
            teachers_by_department[dept] = 0
        teachers_by_department[dept] += 1
    
    return {
        "school_id": school_id,
        "total_teachers": total_teachers,
        "active_teachers": active_teachers,
        "inactive_teachers": inactive_teachers,
        "teachers_by_department": teachers_by_department,
        "total_departments": len(teachers_by_department)
    }
