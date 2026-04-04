"""
项目驱动学习模型
Project-Based Learning Models
包含：项目、项目组、任务、协作等功能
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, JSON, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy import func
import uuid
import enum
from database import Base


class ProjectStatus(str, enum.Enum):
    """项目状态"""
    DRAFT = "draft"  # 草稿
    PUBLISHED = "published"  # 已发布
    IN_PROGRESS = "in_progress"  # 进行中
    COMPLETED = "completed"  # 已完成
    CANCELLED = "cancelled"  # 已取消


class Project(Base):
    """项目表"""
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # 项目基本信息
    title = Column(String(200), nullable=False)
    description = Column(Text)
    objectives = Column(JSON)  # 项目目标列表
    requirements = Column(Text)  # 项目要求
    difficulty_level = Column(String(20), default="medium")  # easy, medium, hard
    estimated_hours = Column(Integer, default=40)  # 预计工时

    # 项目设置
    max_team_size = Column(Integer, default=5)  # 最大团队人数
    min_team_size = Column(Integer, default=3)  # 最小团队人数
    allow_self_organize = Column(Boolean, default=True)  # 允许学生自主组队
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.DRAFT)

    # 时间设置
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    enrollment_deadline = Column(DateTime(timezone=True))

    # 评分标准
    grading_criteria = Column(JSON)  # 评分标准
    max_score = Column(Float, default=100)

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    course = relationship("Course", back_populates="projects")
    teacher = relationship("User", back_populates="created_projects")
    teams = relationship("ProjectTeam", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("ProjectResource", back_populates="project", cascade="all, delete-orphan")


class ProjectTeam(Base):
    """项目团队表"""
    __tablename__ = "project_teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)

    # 团队信息
    team_name = Column(String(100), nullable=False)
    description = Column(Text)
    team_logo = Column(String(500))

    # 团队状态
    status = Column(String(20), default="forming")  # forming, storming, norming, performing
    is_approved = Column(Boolean, default=False)  # 是否被教师批准

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    project = relationship("Project", back_populates="teams")
    members = relationship("ProjectTeamMember", back_populates="team", cascade="all, delete-orphan")
    tasks = relationship("ProjectTask", back_populates="team", cascade="all, delete-orphan")
    submissions = relationship("ProjectSubmission", back_populates="team", cascade="all, delete-orphan")


class ProjectTeamMember(Base):
    """项目团队成员表"""
    __tablename__ = "project_team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("project_teams.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # 成员角色
    role = Column(String(20), default="member")  # leader, member, observer
    responsibilities = Column(JSON)  # 职责列表

    # 贡献统计
    contribution_score = Column(Float, default=0)  # 贡献分数
    tasks_completed = Column(Integer, default=0)  # 完成任务数
    hours_contributed = Column(Float, default=0)  # 贡献工时

    # 评价
    peer_rating = Column(Float)  # 同伴评价分数
    teacher_rating = Column(Float)  # 教师评价分数

    # 时间戳
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    team = relationship("ProjectTeam", back_populates="members")
    user = relationship("User", back_populates="project_memberships")


class ProjectTask(Base):
    """项目任务表"""
    __tablename__ = "project_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    team_id = Column(UUID(as_uuid=True), ForeignKey("project_teams.id"), nullable=True)
    milestone_id = Column(UUID(as_uuid=True), ForeignKey("project_milestones.id"), nullable=True)

    # 任务信息
    title = Column(String(200), nullable=False)
    description = Column(Text)
    task_type = Column(String(20), default="research")  # research, design, development, testing, documentation
    priority = Column(String(20), default="medium")  # low, medium, high, urgent

    # 任务状态
    status = Column(String(20), default="todo")  # todo, in_progress, review, completed, cancelled
    progress_percentage = Column(Integer, default=0)

    # 任务分配
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # 时间规划
    start_date = Column(DateTime(timezone=True))
    due_date = Column(DateTime(timezone=True))
    estimated_hours = Column(Float)
    actual_hours = Column(Float, default=0)

    # 任务关系
    dependencies = Column(JSON)  # 依赖的任务ID列表
    tags = Column(JSON)  # 标签列表

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))

    # 关系
    project = relationship("Project")
    team = relationship("ProjectTeam", back_populates="tasks")
    milestone = relationship("ProjectMilestone", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
    comments = relationship("ProjectTaskComment", back_populates="task", cascade="all, delete-orphan")


class ProjectMilestone(Base):
    """项目里程碑表"""
    __tablename__ = "project_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)

    # 里程碑信息
    title = Column(String(200), nullable=False)
    description = Column(Text)
    order = Column(Integer, default=0)  # 排序

    # 状态
    status = Column(String(20), default="pending")  # pending, in_progress, completed, delayed
    due_date = Column(DateTime(timezone=True))

    # 交付物
    deliverables = Column(JSON)  # 交付物列表

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))

    # 关系
    project = relationship("Project", back_populates="milestones")
    tasks = relationship("ProjectTask", back_populates="milestone")


class ProjectTaskComment(Base):
    """项目任务评论表"""
    __tablename__ = "project_task_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("project_tasks.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # 评论内容
    content = Column(Text, nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("project_task_comments.id"), nullable=True)  # 回复评论

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    task = relationship("ProjectTask", back_populates="comments")
    user = relationship("User", back_populates="task_comments")
    parent = relationship("ProjectTaskComment", remote_side=[id])


class ProjectResource(Base):
    """项目资源表"""
    __tablename__ = "project_resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)

    # 资源信息
    title = Column(String(200), nullable=False)
    description = Column(Text)
    resource_type = Column(String(20), default="document")  # document, video, link, tool, template
    file_url = Column(String(500))
    file_size = Column(Integer)

    # 资源分类
    category = Column(String(50))
    tags = Column(JSON)

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    project = relationship("Project", back_populates="resources")


class ProjectSubmission(Base):
    """项目提交表"""
    __tablename__ = "project_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    team_id = Column(UUID(as_uuid=True), ForeignKey("project_teams.id"), nullable=False)

    # 提交内容
    title = Column(String(200), nullable=False)
    description = Column(Text)
    file_urls = Column(JSON)  # 文件URL列表
    demo_url = Column(String(500))  # 演示链接
    repository_url = Column(String(500))  # 代码仓库链接

    # 提交状态
    status = Column(String(20), default="draft")  # draft, submitted, under_review, accepted, rejected
    submission_type = Column(String(20), default="milestone")  # milestone, final, progress

    # 评价
    score = Column(Float)
    teacher_feedback = Column(Text)
    peer_reviews = Column(JSON)  # 同伴评审

    # 时间戳
    submitted_at = Column(DateTime(timezone=True))
    reviewed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    project = relationship("Project")
    team = relationship("ProjectTeam", back_populates="submissions")


# 更新User模型的关系
from models.user import User
from models.course import Course

# 添加反向关系（如果尚未定义）
if not hasattr(User, 'created_projects'):
    User.created_projects = relationship("Project", back_populates="teacher")
if not hasattr(User, 'project_memberships'):
    User.project_memberships = relationship("ProjectTeamMember", back_populates="user")
if not hasattr(User, 'assigned_tasks'):
    User.assigned_tasks = relationship("ProjectTask", back_populates="assignee")
if not hasattr(User, 'task_comments'):
    User.task_comments = relationship("ProjectTaskComment", back_populates="user")

if not hasattr(Course, 'projects'):
    Course.projects = relationship("Project", back_populates="course")