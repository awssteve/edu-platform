"""
项目管理路由
Project Management Router
功能：项目创建、团队组建、任务管理、协作等
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import logging
from database import get_db
from models import User, Course
from models.project import (
    Project, ProjectTeam, ProjectTeamMember, ProjectTask,
    ProjectMilestone, ProjectTaskComment, ProjectResource, ProjectSubmission, ProjectStatus
)
from routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


# ==================== 项目管理 ====================

@router.post("/courses/{course_id}/projects", status_code=status.HTTP_201_CREATED)
def create_project(
    course_id: UUID,
    title: str,
    description: str = "",
    objectives: List[str] = [],
    requirements: str = "",
    difficulty_level: str = "medium",
    estimated_hours: int = 40,
    max_team_size: int = 5,
    min_team_size: int = 3,
    start_date: str = None,
    end_date: str = None,
    enrollment_deadline: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新项目"""
    try:
        # 验证课程权限
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="课程不存在")

        if course.teacher_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="只有课程教师可以创建项目")

        # 创建项目
        project = Project(
            course_id=course_id,
            teacher_id=current_user.id,
            title=title,
            description=description,
            objectives=objectives,
            requirements=requirements,
            difficulty_level=difficulty_level,
            estimated_hours=estimated_hours,
            max_team_size=max_team_size,
            min_team_size=min_team_size,
            start_date=datetime.fromisoformat(start_date) if start_date else None,
            end_date=datetime.fromisoformat(end_date) if end_date else None,
            enrollment_deadline=datetime.fromisoformat(enrollment_deadline) if enrollment_deadline else None,
            status=ProjectStatus.DRAFT
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        logger.info(f"用户{current_user.id}创建了项目{project.id}")
        return {
            "id": str(project.id),
            "title": project.title,
            "status": project.status,
            "message": "项目创建成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建项目失败：{str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建项目失败：{str(e)}")


@router.get("/courses/{course_id}/projects")
def get_course_projects(
    course_id: UUID,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """获取课程的所有项目"""
    try:
        query = db.query(Project).filter(Project.course_id == course_id)

        if status_filter:
            query = query.filter(Project.status == status_filter)

        projects = query.order_by(Project.created_at.desc()).all()

        return [{
            "id": str(p.id),
            "title": p.title,
            "description": p.description,
            "status": p.status,
            "difficulty_level": p.difficulty_level,
            "estimated_hours": p.estimated_hours,
            "max_team_size": p.max_team_size,
            "min_team_size": p.min_team_size,
            "start_date": p.start_date.isoformat() if p.start_date else None,
            "end_date": p.end_date.isoformat() if p.end_date else None,
            "teams_count": len(p.teams),
            "created_at": p.created_at.isoformat()
        } for p in projects]

    except Exception as e:
        logger.error(f"获取项目列表失败：{str(e)}")
        raise HTTPException(status_code=500, detail=f"获取项目列表失败：{str(e)}")


@router.get("/projects/{project_id}")
def get_project_detail(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """获取项目详情"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        # 获取项目统计信息
        total_teams = len(project.teams)
        total_members = sum(len(team.members) for team in project.teams)
        completed_tasks = db.query(ProjectTask).filter(
            ProjectTask.project_id == project_id,
            ProjectTask.status == "completed"
        ).count()

        return {
            "id": str(project.id),
            "course_id": str(project.course_id),
            "title": project.title,
            "description": project.description,
            "objectives": project.objectives or [],
            "requirements": project.requirements,
            "difficulty_level": project.difficulty_level,
            "estimated_hours": project.estimated_hours,
            "max_team_size": project.max_team_size,
            "min_team_size": project.min_team_size,
            "allow_self_organize": project.allow_self_organize,
            "status": project.status,
            "start_date": project.start_date.isoformat() if project.start_date else None,
            "end_date": project.end_date.isoformat() if project.end_date else None,
            "enrollment_deadline": project.enrollment_deadline.isoformat() if project.enrollment_deadline else None,
            "grading_criteria": project.grading_criteria,
            "max_score": project.max_score,
            "statistics": {
                "total_teams": total_teams,
                "total_members": total_members,
                "completed_tasks": completed_tasks
            },
            "created_at": project.created_at.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取项目详情失败：{str(e)}")
        raise HTTPException(status_code=500, detail=f"获取项目详情失败：{str(e)}")


@router.put("/projects/{project_id}/status")
def update_project_status(
    project_id: UUID,
    new_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新项目状态"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        # 验证权限
        if project.teacher_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="只有项目创建者可以更新状态")

        # 验证状态值
        try:
            project.status = ProjectStatus(new_status)
        except ValueError:
            raise HTTPException(status_code=400, detail="无效的项目状态")

        db.commit()
        logger.info(f"项目{project_id}状态更新为{new_status}")

        return {
            "id": str(project.id),
            "status": project.status,
            "message": "项目状态更新成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新项目状态失败：{str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新项目状态失败：{str(e)}")


# ==================== 团队管理 ====================

@router.post("/projects/{project_id}/teams", status_code=status.HTTP_201_CREATED)
def create_team(
    project_id: UUID,
    team_name: str,
    description: str = "",
    member_ids: List[str] = [],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建项目团队"""
    try:
        # 验证项目
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        # 验证成员数量
        if len(member_ids) < project.min_team_size or len(member_ids) > project.max_team_size:
            raise HTTPException(
                status_code=400,
                detail=f"团队人数必须在{project.min_team_size}到{project.max_team_size}之间"
            )

        # 创建团队
        team = ProjectTeam(
            project_id=project_id,
            team_name=team_name,
            description=description
        )
        db.add(team)
        db.flush()  # 获取team.id

        # 添加团队成员
        for idx, member_id in enumerate(member_ids):
            member = ProjectTeamMember(
                team_id=team.id,
                user_id=UUID(member_id),
                role="leader" if idx == 0 else "member"
            )
            db.add(member)

        db.commit()
        logger.info(f"创建了团队{team.id}，成员数：{len(member_ids)}")

        return {
            "id": str(team.id),
            "team_name": team.team_name,
            "members_count": len(member_ids),
            "message": "团队创建成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建团队失败：{str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建团队失败：{str(e)}")


@router.get("/projects/{project_id}/teams")
def get_project_teams(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """获取项目的所有团队"""
    try:
        teams = db.query(ProjectTeam).filter(ProjectTeam.project_id == project_id).all()

        result = []
        for team in teams:
            members_info = []
            for member in team.members:
                user = db.query(User).filter(User.id == member.user_id).first()
                members_info.append({
                    "id": str(member.user_id),
                    "name": user.full_name or user.username if user else "未知用户",
                    "role": member.role,
                    "contribution_score": member.contribution_score,
                    "tasks_completed": member.tasks_completed
                })

            result.append({
                "id": str(team.id),
                "team_name": team.team_name,
                "description": team.description,
                "status": team.status,
                "is_approved": team.is_approved,
                "members_count": len(team.members),
                "members": members_info,
                "created_at": team.created_at.isoformat()
            })

        return result

    except Exception as e:
        logger.error(f"获取团队列表失败：{str(e)}")
        raise HTTPException(status_code=500, detail=f"获取团队列表失败：{str(e)}")


# ==================== 任务管理 ====================

@router.post("/projects/{project_id}/tasks", status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: UUID,
    title: str,
    description: str = "",
    task_type: str = "research",
    priority: str = "medium",
    assignee_id: str = None,
    due_date: str = None,
    estimated_hours: float = None,
    team_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建项目任务"""
    try:
        # 验证项目
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        # 创建任务
        task = ProjectTask(
            project_id=project_id,
            team_id=UUID(team_id) if team_id else None,
            title=title,
            description=description,
            task_type=task_type,
            priority=priority,
            assignee_id=UUID(assignee_id) if assignee_id else None,
            due_date=datetime.fromisoformat(due_date) if due_date else None,
            estimated_hours=estimated_hours
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        logger.info(f"创建了任务{task.id}")

        return {
            "id": str(task.id),
            "title": task.title,
            "status": task.status,
            "message": "任务创建成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建任务失败：{str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建任务失败：{str(e)}")


@router.get("/projects/{project_id}/tasks")
def get_project_tasks(
    project_id: UUID,
    status_filter: str = None,
    assignee_id: str = None,
    db: Session = Depends(get_db)
):
    """获取项目的所有任务"""
    try:
        query = db.query(ProjectTask).filter(ProjectTask.project_id == project_id)

        if status_filter:
            query = query.filter(ProjectTask.status == status_filter)
        if assignee_id:
            query = query.filter(ProjectTask.assignee_id == UUID(assignee_id))

        tasks = query.order_by(ProjectTask.created_at.desc()).all()

        return [{
            "id": str(t.id),
            "title": t.title,
            "description": t.description,
            "task_type": t.task_type,
            "priority": t.priority,
            "status": t.status,
            "progress_percentage": t.progress_percentage,
            "assignee_id": str(t.assignee_id) if t.assignee_id else None,
            "team_id": str(t.team_id) if t.team_id else None,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "estimated_hours": t.estimated_hours,
            "actual_hours": t.actual_hours,
            "created_at": t.created_at.isoformat()
        } for t in tasks]

    except Exception as e:
        logger.error(f"获取任务列表失败：{str(e)}")
        raise HTTPException(status_code=500, detail=f"获取任务列表失败：{str(e)}")


@router.put("/tasks/{task_id}/status")
def update_task_status(
    task_id: UUID,
    new_status: str,
    progress_percentage: int = None,
    actual_hours: float = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新任务状态"""
    try:
        task = db.query(ProjectTask).filter(ProjectTask.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")

        task.status = new_status
        if progress_percentage is not None:
            task.progress_percentage = progress_percentage
        if actual_hours is not None:
            task.actual_hours = actual_hours

        if new_status == "completed":
            task.completed_at = datetime.now()

        db.commit()
        logger.info(f"任务{task_id}状态更新为{new_status}")

        return {
            "id": str(task.id),
            "status": task.status,
            "progress_percentage": task.progress_percentage,
            "message": "任务状态更新成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新任务状态失败：{str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新任务状态失败：{str(e)}")


# ==================== 里程碑管理 ====================

@router.post("/projects/{project_id}/milestones", status_code=status.HTTP_201_CREATED)
def create_milestone(
    project_id: UUID,
    title: str,
    description: str = "",
    due_date: str = None,
    deliverables: List[str] = [],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建项目里程碑"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        # 获取当前最大order值
        max_order = db.query(ProjectMilestone).filter(
            ProjectMilestone.project_id == project_id
        ).count()

        milestone = ProjectMilestone(
            project_id=project_id,
            title=title,
            description=description,
            due_date=datetime.fromisoformat(due_date) if due_date else None,
            deliverables=deliverables,
            order=max_order + 1
        )

        db.add(milestone)
        db.commit()
        db.refresh(milestone)

        logger.info(f"创建了里程碑{milestone.id}")

        return {
            "id": str(milestone.id),
            "title": milestone.title,
            "order": milestone.order,
            "message": "里程碑创建成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建里程碑失败：{str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建里程碑失败：{str(e)}")


@router.get("/projects/{project_id}/milestones")
def get_project_milestones(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """获取项目的所有里程碑"""
    try:
        milestones = db.query(ProjectMilestone).filter(
            ProjectMilestone.project_id == project_id
        ).order_by(ProjectMilestone.order).all()

        return [{
            "id": str(m.id),
            "title": m.title,
            "description": m.description,
            "status": m.status,
            "due_date": m.due_date.isoformat() if m.due_date else None,
            "deliverables": m.deliverables or [],
            "order": m.order,
            "created_at": m.created_at.isoformat()
        } for m in milestones]

    except Exception as e:
        logger.error(f"获取里程碑列表失败：{str(e)}")
        raise HTTPException(status_code=500, detail=f"获取里程碑列表失败：{str(e)}")