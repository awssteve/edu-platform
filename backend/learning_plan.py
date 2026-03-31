"""
Learning Plan Module
学习计划目标模块
功能：学生可以设置学习计划和目标
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Simple database for learning plans
learning_plans_db = {}
next_plan_id = 1

# Simple database for learning goals
learning_goals_db = {}
next_goal_id = 1

class LearningPlanCreate(BaseModel):
    student_id: int
    course_id: int
    title: str
    description: Optional[str] = None
    start_date: str  # ISO format datetime
    end_date: str  # ISO format datetime
    study_hours_per_week: float = 2.0
    target_completion_percentage: float = 100.0
    reminder_enabled: bool = True
    reminder_frequency: str = "daily"  # daily, weekly, biweekly

class LearningPlanResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    title: str
    description: Optional[str]
    start_date: str
    end_date: str
    study_hours_per_week: float
    target_completion_percentage: float
    current_completion_percentage: float
    status: str  # planned, active, completed, paused, cancelled
    reminder_enabled: bool
    reminder_frequency: str
    progress_count: int
    created_at: str
    updated_at: Optional[str]

class LearningGoalCreate(BaseModel):
    plan_id: int
    goal_type: str  # completion, exam, skill, other
    title: str
    description: Optional[str] = None
    target_date: Optional[str] = None  # ISO format datetime
    target_value: Optional[str] = None  # For numeric goals
    is_completed: bool = False
    priority: str = "medium"  # low, medium, high

class LearningGoalResponse(BaseModel):
    id: int
    plan_id: int
    goal_type: str
    title: str
    description: Optional[str]
    target_date: Optional[str]
    target_value: Optional[str]
    is_completed: bool
    priority: str
    completed_at: Optional[str]
    created_at: str

@router.post("/learning-plans", response_model=LearningPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(plan: LearningPlanCreate):
    global next_plan_id
    
    # Validate dates
    if plan.start_date >= plan.end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    if plan.target_completion_percentage < 0 or plan.target_completion_percentage > 100:
        raise HTTPException(status_code=400, detail="Target completion percentage must be between 0 and 100")
    
    # Create new plan
    new_plan = {
        "id": next_plan_id,
        "student_id": plan.student_id,
        "course_id": plan.course_id,
        "title": plan.title,
        "description": plan.description,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "study_hours_per_week": plan.study_hours_per_week,
        "target_completion_percentage": plan.target_completion_percentage,
        "current_completion_percentage": 0.0,
        "status": "planned",
        "reminder_enabled": plan.reminder_enabled,
        "reminder_frequency": plan.reminder_frequency,
        "progress_count": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": None
    }
    
    learning_plans_db[next_plan_id] = new_plan
    next_plan_id += 1
    
    return LearningPlanResponse(**new_plan)

@router.get("/learning-plans", response_model=List[LearningPlanResponse])
def list_plans(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_plans = []
    
    for p in learning_plans_db.values():
        # Filter by student
        if student_id is not None and p["student_id"] != student_id:
            continue
        
        # Filter by course
        if course_id is not None and p["course_id"] != course_id:
            continue
        
        # Filter by status
        if status is not None and p["status"] != status:
            continue
        
        filtered_plans.append(p)
    
    # Sort by created date (newest first)
    filtered_plans.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    filtered_plans = filtered_plans[skip:skip+limit]
    
    return filtered_plans

@router.get("/learning-plans/{plan_id}", response_model=LearningPlanResponse)
def get_plan(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    return LearningPlanResponse(**plan)

@router.put("/learning-plans/{plan_id}", response_model=LearningPlanResponse)
def update_plan(plan_id: int, plan_update: dict):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    # Update fields
    if "title" in plan_update:
        plan["title"] = plan_update["title"]
    if "description" in plan_update:
        plan["description"] = plan_update["description"]
    if "start_date" in plan_update:
        plan["start_date"] = plan_update["start_date"]
    if "end_date" in plan_update:
        plan["end_date"] = plan_update["end_date"]
    if "study_hours_per_week" in plan_update:
        plan["study_hours_per_week"] = plan_update["study_hours_per_week"]
    if "target_completion_percentage" in plan_update:
        plan["target_completion_percentage"] = plan_update["target_completion_percentage"]
    if "reminder_enabled" in plan_update:
        plan["reminder_enabled"] = plan_update["reminder_enabled"]
    if "reminder_frequency" in plan_update:
        plan["reminder_frequency"] = plan_update["reminder_frequency"]
    if "status" in plan_update:
        plan["status"] = plan_update["status"]
        
        # Auto-set current completion for completed status
        if plan_update["status"] == "completed":
            plan["current_completion_percentage"] = plan["target_completion_percentage"]
    
    plan["updated_at"] = datetime.now().isoformat()
    
    return LearningPlanResponse(**plan)

@router.delete("/learning-plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    del learning_plans_db[plan_id]
    
    return None

@router.post("/learning-plans/{plan_id}/activate", response_model=LearningPlanResponse)
def activate_plan(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    plan["status"] = "active"
    plan["updated_at"] = datetime.now().isoformat()
    
    return LearningPlanResponse(**plan)

@router.post("/learning-plans/{plan_id}/pause", response_model=LearningPlanResponse)
def pause_plan(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    plan["status"] = "paused"
    plan["updated_at"] = datetime.now().isoformat()
    
    return LearningPlanResponse(**plan)

@router.post("/learning-plans/{plan_id}/complete", response_model=LearningPlanResponse)
def complete_plan(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    plan["status"] = "completed"
    plan["current_completion_percentage"] = plan["target_completion_percentage"]
    plan["updated_at"] = datetime.now().isoformat()
    
    return LearningPlanResponse(**plan)

@router.get("/learning-plans/{plan_id}/progress", status_code=status.HTTP_200_OK)
def get_plan_progress(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    # Calculate progress metrics
    total_duration = datetime.fromisoformat(plan["end_date"]) - datetime.fromisoformat(plan["start_date"])
    total_days = total_duration.days
    elapsed = datetime.now() - datetime.fromisoformat(plan["start_date"])
    elapsed_days = elapsed.days if elapsed.total_seconds() > 0 else 0
    
    progress_percentage = min(round((elapsed_days / total_days) * 100, 2), 100.0) if total_days > 0 else 0.0
    
    # Get goals for this plan
    plan_goals = []
    for g in learning_goals_db.values():
        if g["plan_id"] == plan_id:
            plan_goals.append(g)
    
    completed_goals = len([g for g in plan_goals if g["is_completed"]])
    total_goals = len(plan_goals)
    goals_completion = round((completed_goals / total_goals) * 100, 2) if total_goals > 0 else 0.0
    
    return {
        "plan_id": plan_id,
        "title": plan["title"],
        "status": plan["status"],
        "progress_percentage": progress_percentage,
        "current_completion": plan["current_completion_percentage"],
        "target_completion": plan["target_completion_percentage"],
        "total_days": total_days,
        "elapsed_days": elapsed_days,
        "remaining_days": total_days - elapsed_days,
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "goals_completion": goals_completion
    }

@router.get("/learning-plans/student/{student_id}/summary", status_code=status.HTTP_200_OK)
def get_student_plans_summary(student_id: int):
    plans = []
    for p in learning_plans_db.values():
        if p["student_id"] == student_id:
            plans.append(p)
    
    active_plans = len([p for p in plans if p["status"] == "active"])
    completed_plans = len([p for p in plans if p["status"] == "completed"])
    paused_plans = len([p for p in plans if p["status"] == "paused"])
    
    total_study_hours = sum(p["study_hours_per_week"] for p in plans)
    
    return {
        "student_id": student_id,
        "total_plans": len(plans),
        "active_plans": active_plans,
        "completed_plans": completed_plans,
        "paused_plans": paused_plans,
        "total_study_hours_per_week": total_study_hours,
        "average_completion": round(sum(p["current_completion_percentage"] for p in plans) / len(plans), 2) if plans else 0.0
    }

# ===== Learning Goals =====

@router.post("/learning-goals", response_model=LearningGoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal: LearningGoalCreate):
    global next_goal_id
    
    # Validate goal types
    valid_goal_types = ["completion", "exam", "skill", "other"]
    if goal.goal_type not in valid_goal_types:
        raise HTTPException(status_code=400, detail=f"Invalid goal type. Valid types: {valid_goal_types}")
    
    # Validate priorities
    valid_priorities = ["low", "medium", "high"]
    if goal.priority not in valid_priorities:
        raise HTTPException(status_code=400, detail=f"Invalid priority. Valid priorities: {valid_priorities}")
    
    # Create new goal
    new_goal = {
        "id": next_goal_id,
        "plan_id": goal.plan_id,
        "goal_type": goal.goal_type,
        "title": goal.title,
        "description": goal.description,
        "target_date": goal.target_date,
        "target_value": goal.target_value,
        "is_completed": goal.is_completed,
        "priority": goal.priority,
        "completed_at": None,
        "created_at": datetime.now().isoformat()
    }
    
    learning_goals_db[next_goal_id] = new_goal
    next_goal_id += 1
    
    return LearningGoalResponse(**new_goal)

@router.get("/learning-goals", response_model=List[LearningGoalResponse])
def list_goals(
    plan_id: Optional[int] = None,
    student_id: Optional[int] = None,
    is_completed: Optional[bool] = None,
    goal_type: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    filtered_goals = []
    
    for g in learning_goals_db.values():
        # Filter by plan
        if plan_id is not None and g["plan_id"] != plan_id:
            continue
        
        # Filter by student (through plan)
        if student_id is not None:
            plan = learning_plans_db.get(g["plan_id"])
            if not plan or plan["student_id"] != student_id:
                continue
        
        # Filter by completion status
        if is_completed is not None and g["is_completed"] != is_completed:
            continue
        
        # Filter by goal type
        if goal_type is not None and g["goal_type"] != goal_type:
            continue
        
        # Filter by priority
        if priority is not None and g["priority"] != priority:
            continue
        
        filtered_goals.append(g)
    
    # Sort by priority (high first), then by due date
    priority_order = {"high": 0, "medium": 1, "low": 2}
    filtered_goals.sort(key=lambda x: (priority_order.get(x["priority"], 3), x["target_date"] or "9999-12-31", x["created_at"]))
    
    # Pagination
    filtered_goals = filtered_goals[skip:skip+limit]
    
    return filtered_goals

@router.get("/learning-goals/{goal_id}", response_model=LearningGoalResponse)
def get_goal(goal_id: int):
    goal = learning_goals_db.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Learning goal not found")
    
    return LearningGoalResponse(**goal)

@router.put("/learning-goals/{goal_id}", response_model=LearningGoalResponse)
def update_goal(goal_id: int, goal_update: dict):
    goal = learning_goals_db.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Learning goal not found")
    
    # Update fields
    if "title" in goal_update:
        goal["title"] = goal_update["title"]
    if "description" in goal_update:
        goal["description"] = goal_update["description"]
    if "target_date" in goal_update:
        goal["target_date"] = goal_update["target_date"]
    if "target_value" in goal_update:
        goal["target_value"] = goal_update["target_value"]
    if "priority" in goal_update:
        goal["priority"] = goal_update["priority"]
    
    return LearningGoalResponse(**goal)

@router.post("/learning-goals/{goal_id}/complete", response_model=LearningGoalResponse)
def complete_goal(goal_id: int):
    goal = learning_goals_db.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Learning goal not found")
    
    goal["is_completed"] = True
    goal["completed_at"] = datetime.now().isoformat()
    
    # Update plan progress count
    plan_id = goal["plan_id"]
    plan = learning_plans_db.get(plan_id)
    if plan:
        plan["progress_count"] += 1
        
        # Check if all goals completed
        plan_goals = [g for g in learning_goals_db.values() if g["plan_id"] == plan_id]
        if all(g["is_completed"] for g in plan_goals):
            plan["current_completion_percentage"] = plan["target_completion_percentage"]
    
    return LearningGoalResponse(**goal)

@router.delete("/learning-goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int):
    goal = learning_goals_db.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Learning goal not found")
    
    del learning_goals_db[goal_id]
    
    return None

@router.get("/learning-plans/{plan_id}/goals", response_model=List[LearningGoalResponse])
def get_plan_goals(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    # Get all goals for this plan
    goals = []
    for g in learning_goals_db.values():
        if g["plan_id"] == plan_id:
            goals.append(g)
    
    # Sort by priority and completion status
    priority_order = {"high": 0, "medium": 1, "low": 2}
    goals.sort(key=lambda x: (not x["is_completed"], priority_order.get(x["priority"], 3), x["created_at"]))
    
    return goals

@router.get("/learning-plans/{plan_id}/stats", status_code=status.HTTP_200_OK)
def get_plan_stats(plan_id: int):
    plan = learning_plans_db.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    # Get goals for this plan
    goals = []
    for g in learning_goals_db.values():
        if g["plan_id"] == plan_id:
            goals.append(g)
    
    total_goals = len(goals)
    completed_goals = len([g for g in goals if g["is_completed"]])
    in_progress_goals = total_goals - completed_goals
    
    # Goals by priority
    high_priority_goals = len([g for g in goals if g["priority"] == "high"])
    medium_priority_goals = len([g for g in goals if g["priority"] == "medium"])
    low_priority_goals = len([g for g in goals if g["priority"] == "low"])
    
    # Goals by type
    goal_types = {}
    for g in goals:
        goal_type = g["goal_type"]
        if goal_type not in goal_types:
            goal_types[goal_type] = 0
        goal_types[goal_type] += 1
    
    return {
        "plan_id": plan_id,
        "title": plan["title"],
        "status": plan["status"],
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "in_progress_goals": in_progress_goals,
        "completion_rate": round((completed_goals / total_goals) * 100, 2) if total_goals > 0 else 0.0,
        "goals_by_priority": {
            "high": high_priority_goals,
            "medium": medium_priority_goals,
            "low": low_priority_goals
        },
        "goals_by_type": goal_types
    }
