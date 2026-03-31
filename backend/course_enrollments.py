"""
Course Enrollment Module
课程报名模块
功能：学生报名课程、取消报名、查询报名状态
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for enrollments
enrollments_db = {}
next_enrollment_id = 1

class EnrollmentCreate(BaseModel):
    course_id: int
    student_id: int

class EnrollmentResponse(BaseModel):
    id: int
    course_id: int
    student_id: int
    enrolled_at: str
    status: str  # active, completed, cancelled

class EnrollmentStatusResponse(BaseModel):
    is_enrolled: bool
    enrollment_id: Optional[int]
    enrollment_data: Optional[EnrollmentResponse]
    course_info: Optional[dict]

@router.post("/courses/{course_id}/enroll", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_in_course(course_id: int, student_id: int):
    global next_enrollment_id
    
    # Simple check - in real implementation, validate course and student exist
    
    # Check if already enrolled
    for e in enrollments_db.values():
        if e["course_id"] == course_id and e["student_id"] == student_id and e["status"] == "active":
            raise HTTPException(status_code=400, detail="Student already enrolled in this course")
    
    # Create new enrollment
    new_enrollment = {
        "id": next_enrollment_id,
        "course_id": course_id,
        "student_id": student_id,
        "enrolled_at": datetime.now().isoformat(),
        "status": "active"
    }
    
    enrollments_db[next_enrollment_id] = new_enrollment
    next_enrollment_id += 1
    
    return EnrollmentResponse(**new_enrollment)

@router.post("/courses/{course_id}/unenroll", status_code=status.HTTP_200_OK)
def unenroll_from_course(course_id: int, student_id: int):
    # Find active enrollment
    enrollment_id = None
    for e_id, e in enrollments_db.items():
        if (e["course_id"] == course_id and 
            e["student_id"] == student_id and 
            e["status"] == "active"):
            enrollment_id = e_id
            break
    
    if not enrollment_id:
        raise HTTPException(status_code=400, detail="No active enrollment found")
    
    # Update enrollment status
    enrollments_db[enrollment_id]["status"] = "cancelled"
    
    return {
        "message": "Successfully unenrolled from course",
        "enrollment_id": enrollment_id
    }

@router.get("/courses/{course_id}/enrollments", response_model=List[EnrollmentResponse])
def list_course_enrollments(course_id: int, status: Optional[str] = None):
    filtered_enrollments = []
    
    for e in enrollments_db.values():
        # Filter by course
        if e["course_id"] != course_id:
            continue
        
        # Filter by status
        if status and e["status"] != status:
            continue
        
        filtered_enrollments.append(e)
    
    # Sort by enrollment date (newest first)
    filtered_enrollments.sort(key=lambda x: x["enrolled_at"], reverse=True)
    
    return filtered_enrollments

@router.get("/students/{student_id}/enrollments", response_model=List[EnrollmentResponse])
def list_student_enrollments(student_id: int, status: Optional[str] = None):
    filtered_enrollments = []
    
    for e in enrollments_db.values():
        # Filter by student
        if e["student_id"] != student_id:
            continue
        
        # Filter by status
        if status and e["status"] != status:
            continue
        
        filtered_enrollments.append(e)
    
    # Sort by enrollment date (newest first)
    filtered_enrollments.sort(key=lambda x: x["enrolled_at"], reverse=True)
    
    return filtered_enrollments

@router.get("/courses/{course_id}/students/{student_id}/enrollment-status", response_model=EnrollmentStatusResponse)
def get_enrollment_status(course_id: int, student_id: int):
    # Check if enrolled
    enrollment = None
    for e in enrollments_db.values():
        if (e["course_id"] == course_id and 
            e["student_id"] == student_id and 
            e["status"] == "active"):
            enrollment = e
            break
    
    if enrollment:
        return EnrollmentStatusResponse(
            is_enrolled=True,
            enrollment_id=enrollment["id"],
            enrollment_data=EnrollmentResponse(**enrollment),
            course_info={"course_id": course_id}  # In real implementation, fetch course details
        )
    else:
        return EnrollmentStatusResponse(
            is_enrolled=False,
            enrollment_id=None,
            enrollment_data=None,
            course_info={"course_id": course_id}
        )

@router.put("/enrollments/{enrollment_id}/status", response_model=EnrollmentResponse)
def update_enrollment_status(enrollment_id: int, new_status: str):
    enrollment = enrollments_db.get(enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Validate status
    valid_statuses = ["active", "completed", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Valid values: {valid_statuses}")
    
    # Update status
    enrollment["status"] = new_status
    
    return EnrollmentResponse(**enrollment)

@router.get("/enrollments", response_model=List[EnrollmentResponse])
def list_enrollments(
    course_id: Optional[int] = None,
    student_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_enrollments = []
    
    for e in enrollments_db.values():
        # Filter by course
        if course_id is not None and e["course_id"] != course_id:
            continue
        
        # Filter by student
        if student_id is not None and e["student_id"] != student_id:
            continue
        
        # Filter by status
        if status and e["status"] != status:
            continue
        
        filtered_enrollments.append(e)
    
    # Sort by enrollment date (newest first)
    filtered_enrollments.sort(key=lambda x: x["enrolled_at"], reverse=True)
    
    # Pagination
    filtered_enrollments = filtered_enrollments[skip:skip+limit]
    
    return filtered_enrollments

@router.get("/enrollments/summary", status_code=status.HTTP_200_OK)
def get_enrollments_summary():
    total_enrollments = len(enrollments_db)
    active_enrollments = len([e for e in enrollments_db.values() if e["status"] == "active"])
    completed_enrollments = len([e for e in enrollments_db.values() if e["status"] == "completed"])
    cancelled_enrollments = len([e for e in enrollments_db.values() if e["status"] == "cancelled"])
    
    # Calculate unique courses and students
    unique_courses = len(set(e["course_id"] for e in enrollments_db.values()))
    unique_students = len(set(e["student_id"] for e in enrollments_db.values()))
    
    return {
        "total_enrollments": total_enrollments,
        "active_enrollments": active_enrollments,
        "completed_enrollments": completed_enrollments,
        "cancelled_enrollments": cancelled_enrollments,
        "unique_courses": unique_courses,
        "unique_students": unique_students
    }
