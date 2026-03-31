"""
School Management Module
学校管理模块
功能：创建学校、添加学生/教师、学校订阅管理
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for schools
schools_db = {}
next_school_id = 1

# Simple database for school students
school_students_db = {}
next_school_student_id = 1

# Simple database for school teachers
school_teachers_db = {}
next_school_teacher_id = 1

class SchoolCreate(BaseModel):
    name: str
    domain: str  # school domain
    subscription_plan: str = "free"  # free, basic, premium, enterprise
    max_students: int = 100
    max_teachers: int = 10
    expires_at: Optional[str] = None  # ISO format datetime

class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    subscription_plan: Optional[str] = None
    max_students: Optional[int] = None
    max_teachers: Optional[int] = None
    expires_at: Optional[str] = None

class SchoolResponse(BaseModel):
    id: int
    name: str
    domain: str
    subscription_plan: str
    max_students: int
    max_teachers: int
    current_students: int
    current_teachers: int
    expires_at: Optional[str]
    is_active: bool
    created_at: str

class SchoolStudentCreate(BaseModel):
    school_id: int
    user_id: int
    class_name: Optional[str] = None
    student_id: Optional[str] = None
    enrollment_date: Optional[str] = None

class SchoolTeacherCreate(BaseModel):
    school_id: int
    user_id: int
    department: Optional[str] = None
    position: Optional[str] = None
    is_active: bool = True

@router.post("/schools", response_model=SchoolResponse, status_code=status.HTTP_201_CREATED)
def create_school(school: SchoolCreate):
    global next_school_id
    
    # Check if domain already exists
    for s in schools_db.values():
        if s["domain"] == school.domain:
            raise HTTPException(status_code=400, detail="School domain already exists")
    
    # Check if name already exists
    for s in schools_db.values():
        if s["name"] == school.name:
            raise HTTPException(status_code=400, detail="School name already exists")
    
    # Create new school
    new_school = {
        "id": next_school_id,
        "name": school.name,
        "domain": school.domain,
        "subscription_plan": school.subscription_plan,
        "max_students": school.max_students,
        "max_teachers": school.max_teachers,
        "current_students": 0,
        "current_teachers": 0,
        "expires_at": school.expires_at,
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    
    schools_db[next_school_id] = new_school
    next_school_id += 1
    
    return SchoolResponse(**new_school)

@router.get("/schools", response_model=List[SchoolResponse])
def list_schools(
    name: Optional[str] = None,
    subscription_plan: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_schools = []
    
    for s in schools_db.values():
        # Filter by name
        if name and name.lower() not in s["name"].lower():
            continue
        
        # Filter by subscription plan
        if subscription_plan and s["subscription_plan"] != subscription_plan:
            continue
        
        # Filter by active status
        if is_active is not None and s["is_active"] != is_active:
            continue
        
        # Check expiration
        if s["expires_at"]:
            expiry_date = datetime.fromisoformat(s["expires_at"])
            if datetime.now() > expiry_date:
                s["is_active"] = False
        
        filtered_schools.append(s)
    
    # Pagination
    filtered_schools = filtered_schools[skip:skip+limit]
    
    return filtered_schools

@router.get("/schools/{school_id}", response_model=SchoolResponse)
def get_school(school_id: int):
    school = schools_db.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    return SchoolResponse(**school)

@router.put("/schools/{school_id}", response_model=SchoolResponse)
def update_school(school_id: int, school_update: SchoolUpdate):
    school = schools_db.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Update fields
    if school_update.name:
        school["name"] = school_update.name
    if school_update.subscription_plan:
        school["subscription_plan"] = school_update.subscription_plan
    if school_update.max_students:
        school["max_students"] = school_update.max_students
    if school_update.max_teachers:
        school["max_teachers"] = school_update.max_teachers
    if school_update.expires_at:
        school["expires_at"] = school_update.expires_at
    
    # Check expiration
    if school["expires_at"]:
        expiry_date = datetime.fromisoformat(school["expires_at"])
        school["is_active"] = datetime.now() <= expiry_date
    
    return SchoolResponse(**school)

@router.delete("/schools/{school_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_school(school_id: int):
    school = schools_db.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Delete associated students and teachers
    for s_id in list(school_students_db.keys()):
        if school_students_db[s_id]["school_id"] == school_id:
            del school_students_db[s_id]
    
    for t_id in list(school_teachers_db.keys()):
        if school_teachers_db[t_id]["school_id"] == school_id:
            del school_teachers_db[t_id]
    
    del schools_db[school_id]
    
    return None

# ===== School Students =====

@router.post("/schools/students", response_model=dict, status_code=status.HTTP_201_CREATED)
def add_school_student(student: SchoolStudentCreate):
    global next_school_student_id
    
    school = schools_db.get(student.school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Check max students
    if school["current_students"] >= school["max_students"]:
        raise HTTPException(status_code=400, detail="Maximum number of students reached")
    
    # Check if school is active
    if not school["is_active"]:
        raise HTTPException(status_code=400, detail="School is not active")
    
    # Create school student
    new_student = {
        "id": next_school_student_id,
        "school_id": student.school_id,
        "user_id": student.user_id,
        "class_name": student.class_name,
        "student_id": student.student_id,
        "enrollment_date": student.enrollment_date if student.enrollment_date else datetime.now().isoformat()
    }
    
    school_students_db[next_school_student_id] = new_student
    next_school_student_id += 1
    
    # Update school's student count
    school["current_students"] += 1
    
    return {
        "id": new_student["id"],
        "school_id": new_student["school_id"],
        "user_id": new_student["user_id"],
        "message": "Student added to school successfully"
    }

@router.get("/schools/{school_id}/students")
def get_school_students(school_id: int):
    school = schools_db.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    students = []
    for s in school_students_db.values():
        if s["school_id"] == school_id:
            students.append(s)
    
    return {"students": students, "total": len(students)}

@router.delete("/schools/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_school_student(student_id: int):
    student = school_students_db.get(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="School student not found")
    
    school_id = student["school_id"]
    school = schools_db.get(school_id)
    if school:
        school["current_students"] -= 1
    
    del school_students_db[student_id]
    
    return None

# ===== School Teachers =====

@router.post("/schools/teachers", response_model=dict, status_code=status.HTTP_201_CREATED)
def add_school_teacher(teacher: SchoolTeacherCreate):
    global next_school_teacher_id
    
    school = schools_db.get(teacher.school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Check max teachers
    if school["current_teachers"] >= school["max_teachers"]:
        raise HTTPException(status_code=400, detail="Maximum number of teachers reached")
    
    # Check if school is active
    if not school["is_active"]:
        raise HTTPException(status_code=400, detail="School is not active")
    
    # Create school teacher
    new_teacher = {
        "id": next_school_teacher_id,
        "school_id": teacher.school_id,
        "user_id": teacher.user_id,
        "department": teacher.department,
        "position": teacher.position,
        "is_active": teacher.is_active,
        "created_at": datetime.now().isoformat()
    }
    
    school_teachers_db[next_school_teacher_id] = new_teacher
    next_school_teacher_id += 1
    
    # Update school's teacher count
    school["current_teachers"] += 1
    
    return {
        "id": new_teacher["id"],
        "school_id": new_teacher["school_id"],
        "user_id": new_teacher["user_id"],
        "message": "Teacher added to school successfully"
    }

@router.get("/schools/{school_id}/teachers")
def get_school_teachers(school_id: int):
    school = schools_db.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    teachers = []
    for t in school_teachers_db.values():
        if t["school_id"] == school_id:
            teachers.append(t)
    
    return {"teachers": teachers, "total": len(teachers)}

@router.put("/schools/teachers/{teacher_id}/status")
def update_teacher_status(teacher_id: int, is_active: bool):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="School teacher not found")
    
    teacher["is_active"] = is_active
    
    return {
        "id": teacher_id,
        "is_active": is_active,
        "message": "Teacher status updated successfully"
    }

@router.delete("/schools/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_school_teacher(teacher_id: int):
    teacher = school_teachers_db.get(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="School teacher not found")
    
    school_id = teacher["school_id"]
    school = schools_db.get(school_id)
    if school:
        school["current_teachers"] -= 1
    
    del school_teachers_db[teacher_id]
    
    return None

@router.get("/schools/{school_id}/statistics", status_code=status.HTTP_200_OK)
def get_school_statistics(school_id: int):
    school = schools_db.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Count students
    students_count = 0
    for s in school_students_db.values():
        if s["school_id"] == school_id:
            students_count += 1
    
    # Count teachers
    teachers_count = 0
    active_teachers_count = 0
    for t in school_teachers_db.values():
        if t["school_id"] == school_id:
            teachers_count += 1
            if t["is_active"]:
                active_teachers_count += 1
    
    return {
        "school_id": school_id,
        "name": school["name"],
        "subscription_plan": school["subscription_plan"],
        "students": {
            "current": students_count,
            "max": school["max_students"],
            "remaining": school["max_students"] - students_count
        },
        "teachers": {
            "current": teachers_count,
            "active": active_teachers_count,
            "max": school["max_teachers"],
            "remaining": school["max_teachers"] - teachers_count
        },
        "subscription": {
            "plan": school["subscription_plan"],
            "expires_at": school["expires_at"],
            "is_active": school["is_active"],
            "days_remaining": None  # In real implementation, calculate from expiry date
        }
    }
