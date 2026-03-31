"""
Course Search Filter Module
课程搜索筛选模块
功能：学生可以搜索和筛选课程
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for courses
courses_db = {}

class CourseSearchRequest(BaseModel):
    keyword: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    teacher_id: Optional[int] = None
    difficulty: Optional[str] = None  # beginner, intermediate, advanced
    price_range: Optional[str] = None  # free, paid, all
    language: Optional[str] = None
    min_rating: Optional[float] = None
    status: Optional[str] = None  # published, draft, archived

class CourseSearchResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    tags: List[str]
    teacher_id: Optional[int]
    difficulty: Optional[str]
    price: Optional[float]
    language: Optional[str]
    rating: Optional[float]
    review_count: int
    enrollment_count: int
    status: str
    created_at: str

class CourseCategoryResponse(BaseModel):
    name: str
    count: int

@router.get("/courses/search", response_model=List[CourseSearchResponse])
def search_courses(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[str] = None,  # Comma separated
    teacher_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    price_range: Optional[str] = None,
    min_rating: Optional[float] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = "latest",  # latest, popular, rating, price_asc, price_desc
    skip: int = 0,
    limit: int = 100
):
    filtered_courses = []
    
    # Parse tags string to list
    search_tags = []
    if tags:
        search_tags = [t.strip() for t in tags.split(',') if t.strip()]
    
    for c in courses_db.values():
        # Filter by keyword (search in title or description)
        if keyword:
            keyword_lower = keyword.lower()
            if (keyword_lower not in c["title"].lower() and 
                keyword_lower not in c.get("description", "").lower()):
                continue
        
        # Filter by category
        if category and c.get("category") != category:
            continue
        
        # Filter by tags
        if search_tags:
            course_tags = c.get("tags", [])
            if not any(tag in course_tags for tag in search_tags):
                continue
        
        # Filter by teacher
        if teacher_id and c.get("teacher_id") != teacher_id:
            continue
        
        # Filter by difficulty
        if difficulty and c.get("difficulty") != difficulty:
            continue
        
        # Filter by price range
        if price_range:
            course_price = c.get("price", 0)
            if price_range == "free" and course_price > 0:
                continue
            if price_range == "paid" and course_price == 0:
                continue
        
        # Filter by language
        if language and c.get("language") != language:
            continue
        
        # Filter by rating
        if min_rating:
            course_rating = c.get("rating", 0)
            if course_rating < min_rating:
                continue
        
        # Filter by status
        if status and c.get("status") != status:
            continue
        
        filtered_courses.append(c)
    
    # Sort results
    if sort_by == "latest":
        filtered_courses.sort(key=lambda x: x["created_at"], reverse=True)
    elif sort_by == "popular":
        filtered_courses.sort(key=lambda x: x.get("enrollment_count", 0), reverse=True)
    elif sort_by == "rating":
        filtered_courses.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort_by == "price_asc":
        filtered_courses.sort(key=lambda x: x.get("price", 0))
    elif sort_by == "price_desc":
        filtered_courses.sort(key=lambda x: x.get("price", 0), reverse=True)
    else:
        filtered_courses.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    filtered_courses = filtered_courses[skip:skip+limit]
    
    # Convert to response model
    response_courses = []
    for c in filtered_courses:
        response_courses.append(CourseSearchResponse(
            id=c["id"],
            title=c["title"],
            description=c.get("description", ""),
            category=c.get("category", ""),
            tags=c.get("tags", []),
            teacher_id=c.get("teacher_id"),
            difficulty=c.get("difficulty"),
            price=c.get("price"),
            language=c.get("language"),
            rating=c.get("rating"),
            review_count=c.get("review_count", 0),
            enrollment_count=c.get("enrollment_count", 0),
            status=c.get("status", "published"),
            created_at=c["created_at"]
        ))
    
    return response_courses

@router.get("/courses/categories", response_model=List[CourseCategoryResponse])
def get_course_categories():
    # Get all unique categories and their counts
    categories = {}
    
    for c in courses_db.values():
        cat = c.get("category", "uncategorized")
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    # Convert to response
    response_categories = []
    for name, count in categories.items():
        response_categories.append(CourseCategoryResponse(name=name, count=count))
    
    # Sort by count (highest first)
    response_categories.sort(key=lambda x: x.count, reverse=True)
    
    return response_categories

@router.get("/courses/tags", status_code=status.HTTP_200_OK)
def get_course_tags():
    # Get all unique tags
    tags_set = set()
    tag_counts = {}
    
    for c in courses_db.values():
        course_tags = c.get("tags", [])
        for tag in course_tags:
            if tag not in tag_counts:
                tag_counts[tag] = 0
            tag_counts[tag] += 1
            tags_set.add(tag)
    
    # Convert to list and sort by count
    tags = [{"name": name, "count": count} for name, count in tag_counts.items()]
    tags.sort(key=lambda x: x["count"], reverse=True)
    
    return {
        "total_tags": len(tags),
        "tags": tags[:50]  # Return top 50 tags
    }

@router.get("/courses/difficulties", status_code=status.HTTP_200_OK)
def get_course_difficulties():
    # Get all unique difficulties
    difficulties = {}
    
    for c in courses_db.values():
        diff = c.get("difficulty")
        if diff:
            if diff not in difficulties:
                difficulties[diff] = 0
            difficulties[diff] += 1
    
    # Convert to list
    response = [
        {"name": name, "count": count} 
        for name, count in difficulties.items()
    ]
    
    return {
        "total_difficulties": len(response),
        "difficulties": response
    }

@router.get("/courses/languages", status_code=status.HTTP_200_OK)
def get_course_languages():
    # Get all unique languages
    languages = {}
    
    for c in courses_db.values():
        lang = c.get("language")
        if lang:
            if lang not in languages:
                languages[lang] = 0
            languages[lang] += 1
    
    # Convert to list and sort by count
    response = [
        {"name": name, "count": count} 
        for name, count in languages.items()
    ]
    response.sort(key=lambda x: x["count"], reverse=True)
    
    return {
        "total_languages": len(response),
        "languages": response
    }

@router.get("/courses/recommendations", response_model=List[CourseSearchResponse])
def get_course_recommendations(
    user_id: Optional[int] = None,
    based_on: str = "popular",  # popular, recent, categories, tags
    limit: int = 10
):
    recommended_courses = []
    
    # Simple recommendation algorithm
    if based_on == "popular":
        # Sort by enrollment count
        sorted_courses = sorted(courses_db.values(), key=lambda x: x.get("enrollment_count", 0), reverse=True)
        recommended_courses = sorted_courses[:limit]
    
    elif based_on == "recent":
        # Sort by creation date
        sorted_courses = sorted(courses_db.values(), key=lambda x: x["created_at"], reverse=True)
        recommended_courses = sorted_courses[:limit]
    
    elif based_on == "categories":
        # Recommend courses from popular categories
        categories = {}
        for c in courses_db.values():
            cat = c.get("category", "uncategorized")
            if cat not in categories:
                categories[cat] = 0
            categories[cat] += c.get("enrollment_count", 0)
        
        # Get top 3 categories
        top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Get courses from top categories
        for c in courses_db.values():
            if c.get("category") in [cat for cat, _ in top_categories]:
                recommended_courses.append(c)
        
        recommended_courses = recommended_courses[:limit]
    
    elif based_on == "tags":
        # Recommend courses with popular tags
        tags = {}
        for c in courses_db.values():
            course_tags = c.get("tags", [])
            for tag in course_tags:
                if tag not in tags:
                    tags[tag] = 0
                tags[tag] += c.get("enrollment_count", 0)
        
        # Get top 5 tags
        top_tags = sorted(tags.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Get courses with top tags
        for c in courses_db.values():
            course_tags = c.get("tags", [])
            if any(tag in course_tags for tag, _ in top_tags):
                recommended_courses.append(c)
        
        recommended_courses = recommended_courses[:limit]
    
    # Convert to response model
    response_courses = []
    for c in recommended_courses:
        response_courses.append(CourseSearchResponse(
            id=c["id"],
            title=c["title"],
            description=c.get("description", ""),
            category=c.get("category", ""),
            tags=c.get("tags", []),
            teacher_id=c.get("teacher_id"),
            difficulty=c.get("difficulty"),
            price=c.get("price"),
            language=c.get("language"),
            rating=c.get("rating"),
            review_count=c.get("review_count", 0),
            enrollment_count=c.get("enrollment_count", 0),
            status=c.get("status", "published"),
            created_at=c["created_at"]
        ))
    
    return response_courses

@router.get("/courses/saved", response_model=List[CourseSearchResponse])
def get_saved_courses(user_id: int):
    # In real implementation, fetch saved courses for user
    # For now, return empty list
    return []
