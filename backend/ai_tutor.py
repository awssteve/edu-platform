"""
AI助教对话系统
AI Tutor Conversation System
功能：24*7在线教学助手，支持多轮对话、上下文记忆、智能答疑
"""

import json
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Course, CourseMaterial, LearningRecord
from ai_service import get_zhipu_service

logger = logging.getLogger(__name__)


class ConversationContext:
    """对话上下文管理"""

    def __init__(self):
        self.conversations = {}  # {user_id: {course_id: context}}

    def get_context(self, user_id: str, course_id: str) -> Dict:
        """获取对话上下文"""
        if user_id not in self.conversations:
            self.conversations[user_id] = {}

        if course_id not in self.conversations[user_id]:
            self.conversations[user_id][course_id] = {
                "history": [],
                "current_topic": None,
                "learning_state": {},
                "last_interaction": None,
                "session_id": str(uuid4())
            }

        return self.conversations[user_id][course_id]

    def update_context(self, user_id: str, course_id: str, question: str, answer: str, topic: str = None):
        """更新对话上下文"""
        context = self.get_context(user_id, course_id)

        # 添加到历史记录（保留最近10轮）
        context["history"].append({
            "role": "user",
            "content": question,
            "timestamp": datetime.now().isoformat()
        })

        context["history"].append({
            "role": "assistant",
            "content": answer,
            "timestamp": datetime.now().isoformat()
        })

        # 限制历史记录长度
        if len(context["history"]) > 20:  # 10轮对话
            context["history"] = context["history"][-20:]

        # 更新主题
        if topic:
            context["current_topic"] = topic

        # 更新最后交互时间
        context["last_interaction"] = datetime.now()

        # 清理过期会话（24小时）
        self._cleanup_old_contexts()

    def _cleanup_old_contexts(self):
        """清理超过24小时的上下文"""
        cutoff_time = datetime.now() - timedelta(hours=24)

        for user_id in list(self.conversations.keys()):
            for course_id in list(self.conversations[user_id].keys()):
                context = self.conversations[user_id][course_id]
                if context["last_interaction"] and context["last_interaction"] < cutoff_time:
                    del self.conversations[user_id][course_id]

            if not self.conversations[user_id]:
                del self.conversations[user_id]

    def clear_context(self, user_id: str, course_id: str = None):
        """清除对话上下文"""
        if course_id:
            if user_id in self.conversations and course_id in self.conversations[user_id]:
                del self.conversations[user_id][course_id]
        else:
            if user_id in self.conversations:
                del self.conversations[user_id]


# 全局上下文管理器
context_manager = ConversationContext()


class AITutorService:
    """AI助教服务"""

    def __init__(self):
        self.ai_service = None
        self.context_manager = context_manager

    async def chat(
        self,
        user_id: str,
        course_id: str,
        question: str,
        context: Optional[str] = None,
        db: Session = None
    ) -> Dict[str, Any]:
        """
        AI对话答疑

        Args:
            user_id: 用户ID
            course_id: 课程ID
            question: 用户问题
            context: 额外上下文
            db: 数据库会话

        Returns:
            回答结果
        """
        try:
            # 获取AI服务
            if not self.ai_service:
                self.ai_service = get_zhipu_service()

            # 获取对话上下文
            conversation_context = self.context_manager.get_context(user_id, course_id)

            # 获取课程相关信息
            course_info = await self._get_course_context(course_id, db)

            # 构建系统提示词
            system_prompt = self._build_system_prompt(course_info, conversation_context)

            # 构建消息列表
            messages = [{"role": "system", "content": system_prompt}]

            # 添加历史对话
            for msg in conversation_context["history"][-6:]:  # 最近3轮
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            # 添加当前问题
            user_message = question
            if context:
                user_message = f"{context}\n\n问题：{question}"

            messages.append({"role": "user", "content": user_message})

            # 调用AI
            response = await self.ai_service._call_api(messages, temperature=0.7, max_tokens=1500)

            # 更新上下文
            self.context_manager.update_context(
                user_id, course_id, question, response,
                topic=self._extract_topic(question)
            )

            # 记录学习活动
            await self._record_learning_activity(user_id, course_id, question, response, db)

            return {
                "success": True,
                "answer": response,
                "session_id": conversation_context["session_id"],
                "topic": conversation_context["current_topic"],
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"AI对话失败：{str(e)}")
            return {
                "success": False,
                "error": str(e),
                "answer": "抱歉，AI助教暂时无法回答。请稍后重试或联系教师。"
            }

    def _build_system_prompt(self, course_info: Dict, conversation_context: Dict) -> str:
        """构建系统提示词"""
        prompt = """你是一个专业的AI助教，24*7在线帮助学生学习。你的职责包括：

1. **知识答疑** - 准确回答课程相关问题
2. **学习指导** - 提供学习建议和方法指导
3. **进度跟踪** - 关注学生学习进度
4. **个性化帮助** - 根据学生情况提供针对性建议

## 回答原则
- 准确性优先，不确定时坦诚告知
- 鼓励性语言，激发学习兴趣
- 循序渐进，适合学生水平
- 举例说明，帮助理解
- 引导思考，不只是给答案

## 课程信息
"""

        # 添加课程信息
        if course_info.get("title"):
            prompt += f"\n课程名称：{course_info['title']}"
        if course_info.get("description"):
            prompt += f"\n课程描述：{course_info['description']}"
        if course_info.get("knowledge_points"):
            prompt += f"\n知识点：{', '.join(course_info['knowledge_points'][:10])}"

        # 添加当前学习状态
        if conversation_context.get("current_topic"):
            prompt += f"\n当前讨论主题：{conversation_context['current_topic']}"

        prompt += """

## 回答格式
请直接回答学生问题，格式如下：
- 如果有确定答案，直接给出答案
- 如果需要解释，先给答案，再解释原因
- 如果问题不清楚，先确认理解
- 适当使用鼓励性语言

开始你的回答吧！"""

        return prompt

    async def _get_course_context(self, course_id: str, db: Session) -> Dict:
        """获取课程上下文信息"""
        if not db:
            return {}

        try:
            from models import Course, CourseMaterial

            # 获取课程信息
            course = db.query(Course).filter(Course.id == course_id).first()
            if not course:
                return {}

            # 获取课件和知识点
            materials = db.query(CourseMaterial).filter(
                CourseMaterial.course_id == course_id
            ).limit(5).all()

            knowledge_points = []
            for material in materials:
                # 这里可以获取已解析的知识点
                # 简化处理，使用课件标题
                if material.title:
                    knowledge_points.append(material.title)

            return {
                "id": str(course.id),
                "title": course.title,
                "description": course.description,
                "knowledge_points": knowledge_points
            }

        except Exception as e:
            logger.error(f"获取课程上下文失败：{str(e)}")
            return {}

    def _extract_topic(self, question: str) -> str:
        """从问题中提取主题"""
        # 简单的关键词提取
        keywords = {
            "概念": ["是什么", "定义", "概念", "含义"],
            "原理": ["为什么", "原理", "机制", "如何"],
            "方法": ["怎么做", "方法", "步骤", "流程"],
            "例子": ["例子", "举例", "比如", "例如"],
            "练习": ["练习", "习题", "作业", "测试"],
            "进度": ["进度", "学到哪里", "还有多少"],
        }

        for topic, patterns in keywords.items():
            for pattern in patterns:
                if pattern in question:
                    return topic

        return "general"

    async def _record_learning_activity(self, user_id: str, course_id: str, question: str, answer: str, db: Session):
        """记录学习活动"""
        if not db:
            return

        try:
            # 创建学习记录
            record = LearningRecord(
                user_id=UUID(user_id) if isinstance(user_id, str) else user_id,
                course_id=UUID(course_id) if isinstance(course_id, str) else course_id,
                activity_type="ai_chat",
                content=f"Q: {question}\nA: {answer[:100]}",
                duration_minutes=1
            )

            db.add(record)
            db.commit()

        except Exception as e:
            logger.error(f"记录学习活动失败：{str(e)}")

    async def get_learning_guidance(
        self,
        user_id: str,
        course_id: str,
        db: Session = None
    ) -> Dict[str, Any]:
        """
        获取学习建议

        Args:
            user_id: 用户ID
            course_id: 课程ID
            db: 数据库会话

        Returns:
            学习建议
        """
        try:
            # 获取AI服务
            if not self.ai_service:
                self.ai_service = get_zhipu_service()

            # 获取学习数据
            learning_data = await self._get_learning_data(user_id, course_id, db)

            # 构建提示词
            system_prompt = """你是专业的学习顾问，请基于学生的学习数据提供个性化建议。

建议格式：
{
    "overall_assessment": "整体学习状况",
    "strong_points": ["强项1", "强项2"],
    "improvement_areas": ["需要改进的方面"],
    "specific_suggestions": [
        {"priority": "high/medium/low", "action": "具体行动建议", "reason": "原因"}
    ],
    "next_steps": ["下一步学习建议"]
}"""

            user_prompt = f"""请为以下学生提供学习建议：

学习数据：
{json.dumps(learning_data, ensure_ascii=False, indent=2)}

请提供具体、可操作的学习建议。"""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            response = await self.ai_service._call_api(messages, temperature=0.6, max_tokens=1500)

            # 解析JSON响应
            try:
                clean_response = response.strip()
                if clean_response.startswith("```json"):
                    clean_response = clean_response[7:]
                if clean_response.startswith("```"):
                    clean_response = clean_response[3:]
                if clean_response.endswith("```"):
                    clean_response = clean_response[:-3]
                clean_response = clean_response.strip()

                guidance = json.loads(clean_response)

                return {
                    "success": True,
                    "guidance": guidance,
                    "timestamp": datetime.now().isoformat()
                }

            except json.JSONDecodeError:
                return {
                    "success": True,
                    "guidance": {
                        "overall_assessment": response[:500],
                        "strong_points": [],
                        "improvement_areas": [],
                        "specific_suggestions": [],
                        "next_steps": []
                    },
                    "timestamp": datetime.now().isoformat()
                }

        except Exception as e:
            logger.error(f"获取学习建议失败：{str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _get_learning_data(self, user_id: str, course_id: str, db: Session) -> Dict:
        """获取学习数据"""
        if not db:
            return {}

        try:
            from models import LearningRecord, LearningProgress
            from sqlalchemy import func
            from uuid import UUID

            # 学习进度
            progress = db.query(LearningProgress).filter(
                LearningProgress.user_id == UUID(user_id),
                LearningProgress.course_id == UUID(course_id)
            ).first()

            # 学习时长
            time_result = db.query(
                func.coalesce(func.sum(LearningRecord.duration_minutes), 0)
            ).filter(
                LearningRecord.user_id == UUID(user_id),
                LearningRecord.course_id == UUID(course_id)
            ).first()

            total_minutes = int(time_result[0] or 0)

            # 最近活动
            recent_activities = db.query(LearningRecord).filter(
                LearningRecord.user_id == UUID(user_id),
                LearningRecord.course_id == UUID(course_id)
            ).order_by(LearningRecord.created_at.desc()).limit(10).all()

            return {
                "user_id": user_id,
                "course_id": course_id,
                "progress_percentage": progress.progress_percentage if progress else 0,
                "total_study_minutes": total_minutes,
                "total_hours": round(total_minutes / 60, 1),
                "last_activity": recent_activities[0].created_at.isoformat() if recent_activities else None,
                "activity_count": len(recent_activities)
            }

        except Exception as e:
            logger.error(f"获取学习数据失败：{str(e)}")
            return {}


# 全局AI助教服务实例
_ai_tutor_service: Optional[AITutorService] = None


def get_ai_tutor_service() -> AITutorService:
    """获取AI助教服务实例"""
    global _ai_tutor_service
    if _ai_tutor_service is None:
        _ai_tutor_service = AITutorService()
    return _ai_tutor_service


# 导入UUID
from uuid import UUID