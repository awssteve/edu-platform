"""
AI助教路由
AI Tutor Router
功能：24*7在线教学助手API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from database import get_db
from routers.auth import get_current_user
from models import User
from ai_tutor import get_ai_tutor_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    """对话请求"""
    course_id: str
    question: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    """对话响应"""
    success: bool
    answer: str
    session_id: str
    topic: Optional[str] = None
    error: Optional[str] = None
    timestamp: str


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai_tutor(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    与AI助教对话

    **24*7在线教学助手**

    功能：
    - 实时答疑
    - 学习指导
    - 进度跟踪
    - 个性化建议

    特点：
    - 支持多轮对话
    - 上下文记忆
    - 智能理解
    - 鼓励性回复
    """
    try:
        # 验证课程权限
        from models import Course, CourseEnrollment
        course = db.query(Course).filter(Course.id == UUID(request.course_id)).first()
        if not course:
            raise HTTPException(status_code=404, detail="课程不存在")

        # 检查学生是否已报名
        if current_user.role == "student":
            enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == current_user.id,
                CourseEnrollment.course_id == UUID(request.course_id)
            ).first()
            if not enrollment:
                raise HTTPException(status_code=403, detail="请先报名该课程")

        # 调用AI助教
        tutor_service = get_ai_tutor_service()

        result = await tutor_service.chat(
            user_id=str(current_user.id),
            course_id=request.course_id,
            question=request.question,
            context=request.context,
            db=db
        )

        if result.get("success"):
            return ChatResponse(
                success=True,
                answer=result["answer"],
                session_id=result["session_id"],
                topic=result.get("topic"),
                timestamp=result["timestamp"]
            )
        else:
            return ChatResponse(
                success=False,
                answer=result.get("answer", "抱歉，服务暂时不可用"),
                session_id="",
                error=result.get("error"),
                timestamp=""
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI对话失败：{str(e)}")
        return ChatResponse(
            success=False,
            answer="抱歉，AI助教暂时无法回答。请稍后重试或联系教师。",
            session_id="",
            error=str(e),
            timestamp=""
        )


@router.post("/clear-context")
async def clear_conversation_context(
    course_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    清除对话上下文

    开始新的对话会话
    """
    try:
        from ai_tutor import context_manager

        context_manager.clear_context(str(current_user.id), course_id)

        return {
            "success": True,
            "message": "对话上下文已清除，开始新会话"
        }

    except Exception as e:
        logger.error(f"清除对话上下文失败：{str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"清除对话上下文失败：{str(e)}"
        )


@router.get("/guidance/{course_id}")
async def get_learning_guidance(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取个性化学习建议

    AI助教基于学习数据分析，提供：
    - 整体学习状况评估
    - 优势和不足分析
    - 具体改进建议
    - 下一步学习计划
    """
    try:
        # 验证课程权限
        from models import Course, CourseEnrollment
        course = db.query(Course).filter(Course.id == UUID(course_id)).first()
        if not course:
            raise HTTPException(status_code=404, detail="课程不存在")

        if current_user.role == "student":
            enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == current_user.id,
                CourseEnrollment.course_id == UUID(course_id)
            ).first()
            if not enrollment:
                raise HTTPException(status_code=403, detail="请先报名该课程")

        # 获取学习建议
        tutor_service = get_ai_tutor_service()

        result = await tutor_service.get_learning_guidance(
            user_id=str(current_user.id),
            course_id=course_id,
            db=db
        )

        if result.get("success"):
            return {
                "success": True,
                "course_id": course_id,
                "course_title": course.title,
                "guidance": result["guidance"],
                "timestamp": result["timestamp"]
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="获取学习建议失败"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取学习建议失败：{str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取学习建议失败：{str(e)}"
        )


@router.get("/history/{course_id}")
async def get_conversation_history(
    course_id: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """
    获取对话历史记录

    查看与AI助教的最近对话
    """
    try:
        from ai_tutor import context_manager

        context = context_manager.get_context(str(current_user.id), course_id)

        # 获取最近N轮对话
        history = context["history"][-limit*2:]  # 每轮包含user和assistant

        return {
            "success": True,
            "course_id": course_id,
            "session_id": context["session_id"],
            "total_turns": len(context["history"]) // 2,
            "history": history,
            "current_topic": context.get("current_topic")
        }

    except Exception as e:
        logger.error(f"获取对话历史失败：{str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取对话历史失败：{str(e)}"
        )


@router.get("/health")
async def ai_tutor_health():
    """
    AI助教健康检查

    检查AI助教服务是否正常运行
    """
    try:
        tutor_service = get_ai_tutor_service()

        # 简单测试AI服务
        if tutor_service.ai_service:
            return {
                "status": "healthy",
                "service": "AI Tutor",
                "features": [
                    "24*7在线答疑",
                    "多轮对话支持",
                    "上下文记忆",
                    "学习建议",
                    "进度跟踪"
                ],
                "active_sessions": len(tutor_service.context_manager.conversations)
            }
        else:
            return {
                "status": "degraded",
                "service": "AI Tutor",
                "message": "AI服务未配置，请设置API密钥"
            }

    except Exception as e:
        logger.error(f"AI助教健康检查失败：{str(e)}")
        return {
            "status": "unhealthy",
            "service": "AI Tutor",
            "error": str(e)
        }


@router.post("/feedback")
async def submit_feedback(
    course_id: str,
    session_id: str,
    rating: int,
    feedback: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    提交AI助教反馈

    帮助改进AI助教服务质量
    """
    try:
        # 这里可以保存反馈到数据库
        # 简化处理，只记录日志
        logger.info(
            f"用户{current_user.id}提交反馈："
            f"课程{course_id}，会话{session_id}，评分{rating}，反馈{feedback}"
        )

        return {
            "success": True,
            "message": "感谢您的反馈！这将帮助我们改进AI助教服务。"
        }

    except Exception as e:
        logger.error(f"提交反馈失败：{str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"提交反馈失败：{str(e)}"
        )