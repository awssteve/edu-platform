"""
Discussion Forum Module
讨论区模块
功能：创建讨论主题、发布回复、点赞功能
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for discussion topics
discussion_topics_db = {}
next_topic_id = 1

# Simple database for discussion replies
discussion_replies_db = {}
next_reply_id = 1

# Simple database for discussion likes
discussion_likes_db = {}
next_like_id = 1

class DiscussionTopicCreate(BaseModel):
    course_id: Optional[int] = None
    author_id: int
    title: str
    content: str
    tags: List[str] = []
    is_pinned: bool = False

class DiscussionTopicResponse(BaseModel):
    id: int
    course_id: Optional[int]
    author_id: int
    title: str
    content: str
    tags: List[str]
    is_pinned: bool
    reply_count: int
    view_count: int
    like_count: int
    last_reply_at: Optional[str]
    created_at: str

class DiscussionReplyCreate(BaseModel):
    topic_id: int
    author_id: int
    content: str
    parent_id: Optional[int] = None

class DiscussionReplyResponse(BaseModel):
    id: int
    topic_id: int
    parent_id: Optional[int]
    author_id: int
    content: str
    like_count: int
    created_at: str

class DiscussionLikeCreate(BaseModel):
    topic_id: int
    user_id: int

class DiscussionLikeResponse(BaseModel):
    id: int
    topic_id: int
    user_id: int
    created_at: str

# ===== Discussion Topics =====

@router.post("/discussions", response_model=DiscussionTopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(topic: DiscussionTopicCreate):
    global next_topic_id
    
    new_topic = {
        "id": next_topic_id,
        "course_id": topic.course_id,
        "author_id": topic.author_id,
        "title": topic.title,
        "content": topic.content,
        "tags": topic.tags,
        "is_pinned": topic.is_pinned,
        "reply_count": 0,
        "view_count": 0,
        "like_count": 0,
        "last_reply_at": None,
        "created_at": datetime.now().isoformat()
    }
    
    discussion_topics_db[next_topic_id] = new_topic
    next_topic_id += 1
    
    return DiscussionTopicResponse(**new_topic)

@router.get("/discussions", response_model=List[DiscussionTopicResponse])
def list_topics(
    course_id: Optional[int] = None,
    is_pinned: Optional[bool] = None,
    tag: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_topics = []
    
    for t in discussion_topics_db.values():
        # Filter by course
        if course_id is not None and t["course_id"] != course_id:
            continue
        
        # Filter by pinned status
        if is_pinned is not None and t["is_pinned"] != is_pinned:
            continue
        
        # Filter by tag
        if tag and tag not in t["tags"]:
            continue
        
        filtered_topics.append(t)
    
    # Sort: pinned first, then by last reply time (newest first)
    filtered_topics.sort(key=lambda x: (not x["is_pinned"], x["last_reply_at"] or x["created_at"]), reverse=True)
    
    # Pagination
    filtered_topics = filtered_topics[skip:skip+limit]
    
    return filtered_topics

@router.get("/discussions/{topic_id}", response_model=DiscussionTopicResponse)
def get_topic(topic_id: int):
    topic = discussion_topics_db.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Discussion topic not found")
    
    # Increment view count
    topic["view_count"] += 1
    
    return DiscussionTopicResponse(**topic)

@router.get("/discussions/{topic_id}/replies", response_model=List[DiscussionReplyResponse])
def get_topic_replies(topic_id: int):
    topic = discussion_topics_db.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Discussion topic not found")
    
    # Get all replies for this topic
    replies = []
    for r in discussion_replies_db.values():
        if r["topic_id"] == topic_id:
            replies.append(r)
    
    # Sort by created date (oldest first for replies)
    replies.sort(key=lambda x: x["created_at"])
    
    return replies

# ===== Discussion Replies =====

@router.post("/discussions/{topic_id}/replies", response_model=DiscussionReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply(topic_id: int, reply: DiscussionReplyCreate):
    global next_reply_id
    
    topic = discussion_topics_db.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Discussion topic not found")
    
    new_reply = {
        "id": next_reply_id,
        "topic_id": topic_id,
        "parent_id": reply.parent_id,
        "author_id": reply.author_id,
        "content": reply.content,
        "like_count": 0,
        "created_at": datetime.now().isoformat()
    }
    
    discussion_replies_db[next_reply_id] = new_reply
    next_reply_id += 1
    
    # Update topic's reply count and last reply time
    topic["reply_count"] += 1
    topic["last_reply_at"] = new_reply["created_at"]
    
    return DiscussionReplyResponse(**new_reply)

# ===== Discussion Likes =====

@router.post("/discussions/{topic_id}/like", response_model=DiscussionLikeResponse, status_code=status.HTTP_201_CREATED)
def like_topic(topic_id: int, like: DiscussionLikeCreate):
    global next_like_id
    
    topic = discussion_topics_db.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Discussion topic not found")
    
    # Check if user already liked
    for l in discussion_likes_db.values():
        if l["topic_id"] == topic_id and l["user_id"] == like.user_id:
            raise HTTPException(status_code=400, detail="User already liked this topic")
    
    # Create like
    new_like = {
        "id": next_like_id,
        "topic_id": topic_id,
        "user_id": like.user_id,
        "created_at": datetime.now().isoformat()
    }
    
    discussion_likes_db[next_like_id] = new_like
    next_like_id += 1
    
    # Update topic's like count
    topic["like_count"] += 1
    
    return DiscussionLikeResponse(**new_like)

@router.delete("/discussions/{topic_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def unlike_topic(topic_id: int, user_id: int):
    topic = discussion_topics_db.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Discussion topic not found")
    
    # Find and delete like
    like_id = None
    for l_id, l in discussion_likes_db.items():
        if l["topic_id"] == topic_id and l["user_id"] == user_id:
            like_id = l_id
            break
    
    if like_id is not None:
        del discussion_likes_db[like_id]
        # Update topic's like count
        topic["like_count"] -= 1
    
    return None

@router.get("/discussions/{topic_id}/likes", response_model=List[DiscussionLikeResponse])
def get_topic_likes(topic_id: int):
    topic = discussion_topics_db.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Discussion topic not found")
    
    # Get all likes for this topic
    likes = []
    for l in discussion_likes_db.values():
        if l["topic_id"] == topic_id:
            likes.append(l)
    
    return likes
