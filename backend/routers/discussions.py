from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from database import get_db
from models import User, Course, DiscussionTopic, DiscussionReply, DiscussionLike
from .auth import get_current_user

router = APIRouter()

@router.post("/topics/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_topic(
    course_id: UUID,
    title: str,
    content: str,
    tags: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    topic = DiscussionTopic(
        course_id=course_id,
        creator_id=current_user.id,
        title=title,
        content=content,
        tags=tags or []
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    return {
        "id": topic.id,
        "title": topic.title,
        "content": topic.content,
        "created_at": topic.created_at
    }

@router.get("/courses/{course_id}/topics", response_model=List[dict])
def get_course_topics(
    course_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort: str = "latest",  # latest, most_replies
    db: Session = Depends(get_db)
):
    query = db.query(DiscussionTopic).filter(DiscussionTopic.course_id == course_id)
    
    if sort == "latest":
        query = query.order_by(DiscussionTopic.created_at.desc())
    elif sort == "most_replies":
        query = query.order_by(DiscussionTopic.reply_count.desc())
    
    topics = query.options(
        joinedload(DiscussionTopic.creator)
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": t.id,
            "title": t.title,
            "content": t.content,
            "creator": t.creator.full_name,
            "tags": t.tags,
            "is_pinned": t.is_pinned,
            "reply_count": t.reply_count,
            "last_reply_at": t.last_reply_at,
            "created_at": t.created_at
        }
        for t in topics
    ]

@router.get("/topics/{topic_id}", response_model=dict)
def get_topic(
    topic_id: UUID,
    db: Session = Depends(get_db)
):
    topic = db.query(DiscussionTopic).filter(
        DiscussionTopic.id == topic_id
    ).first()
    
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    
    # Increment view count
    topic.view_count += 1
    db.commit()
    
    return {
        "id": topic.id,
        "title": topic.title,
        "content": topic.content,
        "tags": topic.tags,
        "is_pinned": topic.is_pinned,
        "is_locked": topic.is_locked,
        "view_count": topic.view_count,
        "reply_count": topic.reply_count,
        "created_at": topic.created_at
    }

@router.post("/topics/{topic_id}/replies", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_reply(
    topic_id: UUID,
    content: str,
    parent_reply_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = db.query(DiscussionTopic).filter(DiscussionTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    
    if topic.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic is locked"
        )
    
    reply = DiscussionReply(
        topic_id=topic_id,
        user_id=current_user.id,
        parent_reply_id=parent_reply_id,
        content=content
    )
    db.add(reply)
    
    # Update topic
    topic.reply_count += 1
    topic.last_reply_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "id": reply.id,
        "content": reply.content,
        "created_at": reply.created_at
    }

@router.post("/replies/{reply_id}/like", status_code=status.HTTP_201_CREATED)
def like_reply(
    reply_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reply not found")
    
    # Check if already liked
    existing = db.query(DiscussionLike).filter(
        DiscussionLike.user_id == current_user.id,
        DiscussionLike.reply_id == reply_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already liked"
        )
    
    like = DiscussionLike(
        user_id=current_user.id,
        reply_id=reply_id
    )
    db.add(like)
    
    reply.like_count += 1
    db.commit()
    
    return {"message": "Liked successfully"}
