"""
Course Review Module
课程评价模块
功能：学生评价课程、评分、评价管理
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for course reviews
course_reviews_db = {}
next_review_id = 1

class CourseReviewCreate(BaseModel):
    course_id: int
    student_id: int
    rating: int  # 1-5 stars
    title: str
    content: str
    is_anonymous: bool = False

class CourseReviewUpdate(BaseModel):
    rating: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None

class CourseReviewResponse(BaseModel):
    id: int
    course_id: int
    student_id: int
    student_name: str
    rating: int
    title: str
    content: str
    is_anonymous: bool
    likes_count: int
    created_at: str
    updated_at: Optional[str]

@router.post("/reviews", response_model=CourseReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(review: CourseReviewCreate):
    global next_review_id
    
    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if student already reviewed this course
    for r in course_reviews_db.values():
        if r["course_id"] == review.course_id and r["student_id"] == review.student_id:
            raise HTTPException(status_code=400, detail="Student has already reviewed this course")
    
    # Create new review
    new_review = {
        "id": next_review_id,
        "course_id": review.course_id,
        "student_id": review.student_id,
        "student_name": "Anonymous" if review.is_anonymous else "Student Name",  # In real implementation, fetch from user database
        "rating": review.rating,
        "title": review.title,
        "content": review.content,
        "is_anonymous": review.is_anonymous,
        "likes_count": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": None
    }
    
    course_reviews_db[next_review_id] = new_review
    next_review_id += 1
    
    return CourseReviewResponse(**new_review)

@router.get("/reviews", response_model=List[CourseReviewResponse])
def list_reviews(
    course_id: Optional[int] = None,
    student_id: Optional[int] = None,
    rating: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_reviews = []
    
    for r in course_reviews_db.values():
        # Filter by course
        if course_id is not None and r["course_id"] != course_id:
            continue
        
        # Filter by student
        if student_id is not None and r["student_id"] != student_id:
            continue
        
        # Filter by rating
        if rating is not None and r["rating"] != rating:
            continue
        
        filtered_reviews.append(r)
    
    # Sort by rating (highest first), then by created date (newest first)
    filtered_reviews.sort(key=lambda x: (-x["rating"], x["created_at"]))
    
    # Pagination
    filtered_reviews = filtered_reviews[skip:skip+limit]
    
    return filtered_reviews

@router.get("/reviews/{review_id}", response_model=CourseReviewResponse)
def get_review(review_id: int):
    review = course_reviews_db.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return CourseReviewResponse(**review)

@router.put("/reviews/{review_id}", response_model=CourseReviewResponse)
def update_review(review_id: int, review_update: CourseReviewUpdate):
    review = course_reviews_db.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Update fields
    if review_update.rating is not None:
        # Validate rating
        if review_update.rating < 1 or review_update.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        review["rating"] = review_update.rating
    if review_update.title is not None:
        review["title"] = review_update.title
    if review_update.content is not None:
        review["content"] = review_update.content
    
    review["updated_at"] = datetime.now().isoformat()
    
    return CourseReviewResponse(**review)

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int):
    review = course_reviews_db.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    del course_reviews_db[review_id]
    
    return None

@router.post("/reviews/{review_id}/like", status_code=status.HTTP_200_OK)
def like_review(review_id: int):
    review = course_reviews_db.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review["likes_count"] += 1
    
    return {
        "review_id": review_id,
        "likes_count": review["likes_count"],
        "message": "Review liked successfully"
    }

@router.delete("/reviews/{review_id}/like", status_code=status.HTTP_200_OK)
def unlike_review(review_id: int):
    review = course_reviews_db.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review["likes_count"] > 0:
        review["likes_count"] -= 1
    
    return {
        "review_id": review_id,
        "likes_count": review["likes_count"],
        "message": "Review unliked successfully"
    }

@router.get("/reviews/course/{course_id}/summary", status_code=status.HTTP_200_OK)
def get_course_review_summary(course_id: int):
    # Get all reviews for this course
    reviews = []
    for r in course_reviews_db.values():
        if r["course_id"] == course_id:
            reviews.append(r)
    
    if not reviews:
        return {
            "course_id": course_id,
            "total_reviews": 0,
            "average_rating": 0.0,
            "rating_distribution": {
                "5": 0,
                "4": 0,
                "3": 0,
                "2": 0,
                "1": 0
            }
        }
    
    # Calculate average rating
    total_rating = sum(r["rating"] for r in reviews)
    average_rating = round(total_rating / len(reviews), 1) if reviews else 0.0
    
    # Calculate rating distribution
    rating_distribution = {
        "5": sum(1 for r in reviews if r["rating"] == 5),
        "4": sum(1 for r in reviews if r["rating"] == 4),
        "3": sum(1 for r in reviews if r["rating"] == 3),
        "2": sum(1 for r in reviews if r["rating"] == 2),
        "1": sum(1 for r in reviews if r["rating"] == 1)
    }
    
    return {
        "course_id": course_id,
        "total_reviews": len(reviews),
        "average_rating": average_rating,
        "rating_distribution": rating_distribution,
        "total_likes": sum(r["likes_count"] for r in reviews)
    }

@router.get("/reviews/student/{student_id}", response_model=List[CourseReviewResponse])
def get_student_reviews(student_id: int):
    reviews = []
    for r in course_reviews_db.values():
        if r["student_id"] == student_id:
            reviews.append(r)
    
    # Sort by created date (newest first)
    reviews.sort(key=lambda x: x["created_at"], reverse=True)
    
    return reviews

@router.get("/reviews/course/{course_id}/top", response_model=List[CourseReviewResponse])
def get_top_reviews(course_id: int, limit: int = 5):
    # Get all reviews for this course
    reviews = []
    for r in course_reviews_db.values():
        if r["course_id"] == course_id:
            reviews.append(r)
    
    # Sort by rating (highest first), then by likes count
    reviews.sort(key=lambda x: (-x["rating"], -x["likes_count"]))
    
    # Return top reviews
    return reviews[:limit]
