from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Simple user database (list-based)
users_list = []
next_user_id = 1

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    tags: List[str]
    teacher_id: Optional[int] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    tags: List[str]
    teacher_id: Optional[int]
    teacher_name: Optional[str]
    enrollment_count: int
    created_at: str
    updated_at: str

# Simple course database (list-based)
courses_db = {}
next_course_id = 1

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    # Simple token validation (skip for now)
    # TODO: Implement proper JWT validation
    return None

@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate):
    global next_course_id
    
    # Check if title exists
    for c in courses_db.values():
        if c["title"] == course.title:
            raise HTTPException(status_code=400, detail="Course title already exists")
    
    # Create new course
    new_course = {
        "id": next_course_id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "tags": course.tags,
        "teacher_id": course.teacher_id,
        "teacher_name": "Unknown" if course.teacher_id is None else get_teacher_name(course.teacher_id),
        "enrollment_count": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    courses_db[next_course_id] = new_course
    next_course_id += 1
    
    return CourseResponse(**new_course)

def get_teacher_name(teacher_id: int) -> str:
    for u in users_list:
        if u["id"] == teacher_id:
            return u["full_name"]
    return "Unknown"

@router.get("/courses", response_model=List[CourseResponse])
def list_courses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    filtered_courses = []
    
    for c in courses_db.values():
        # Filter by category
        if category and c["category"] != category:
            continue
        
        # Filter by search
        if search:
            search_lower = search.lower()
            if (search_lower not in c["title"].lower() and
                search_lower not in c["description"].lower()):
                continue
        
        filtered_courses.append(c)
    
    # Pagination
    filtered_courses = filtered_courses[skip:skip+limit]
    
    return filtered_courses

@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(course_id: int):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return CourseResponse(**course)

@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, course_update: CourseUpdate):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Update course fields
    if course_update.title is not None:
        course["title"] = course_update.title
    if course_update.description is not None:
        course["description"] = course_update.description
    if course_update.category is not None:
        course["category"] = course_update.category
    if course_update.tags is not None:
        course["tags"] = course_update.tags
    
    course["updated_at"] = datetime.now().isoformat()
    
    return CourseResponse(**course)

@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    del courses_db[course_id]
    
    return None

@router.post("/courses/{course_id}/enroll", status_code=status.HTTP_200_OK)
def enroll_in_course(course_id: int):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course["enrollment_count"] += 1
    course["updated_at"] = datetime.now().isoformat()
    
    return {"message": "Successfully enrolled in course"}
