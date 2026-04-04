"""
智谱AI服务模块
Zhipu AI Service Module
功能：调用智谱AI API实现课件解析、题目生成、智能批改等
"""

import httpx
import json
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ZhipuAIService:
    """智谱AI服务类"""

    def __init__(self, api_key: str):
        """
        初始化智谱AI服务

        Args:
            api_key: 智谱AI API密钥
        """
        self.api_key = api_key
        self.base_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        self.model = "glm-4-flash"  # 使用更快的模型
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def _call_api(self, messages: List[Dict], temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """
        调用智谱AI API

        Args:
            messages: 消息列表
            temperature: 温度参数
            max_tokens: 最大token数

        Returns:
            AI响应内容
        """
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "top_p": 0.9,
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()

                result = response.json()
                return result["choices"][0]["message"]["content"]

        except httpx.HTTPError as e:
            logger.error(f"智谱API调用失败: {str(e)}")
            raise Exception(f"AI服务调用失败: {str(e)}")
        except Exception as e:
            logger.error(f"智谱AI服务错误: {str(e)}")
            raise

    async def parse_material_content(self, content: str, material_type: str = "pdf") -> Dict[str, Any]:
        """
        解析课件内容，提取知识点

        Args:
            content: 课件文本内容
            material_type: 课件类型（pdf/ppt/docx）

        Returns:
            包含知识点、摘要、主题的字典
        """
        system_prompt = """你是一个专业的教育内容分析专家。你的任务是分析课件内容并提取关键信息。

请按照以下JSON格式返回分析结果：
{
    "summary": "课件内容摘要（100-200字）",
    "knowledge_points": ["知识点1", "知识点2", "知识点3"],
    "key_concepts": ["核心概念1", "核心概念2"],
    "difficulty_level": "beginner/intermediate/advanced",
    "estimated_study_time": 预计学习时长（分钟）,
    "topics": ["主题1", "主题2"]
}"""

        user_prompt = f"""请分析以下{material_type.upper()}课件内容，提取知识点和关键信息：

{content[:4000]}  # 限制长度避免超出token限制

请以JSON格式返回分析结果。"""

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            response = await self._call_api(messages, temperature=0.3)

            # 尝试解析JSON响应
            try:
                # 清理可能的markdown代码块标记
                clean_response = response.strip()
                if clean_response.startswith("```json"):
                    clean_response = clean_response[7:]
                if clean_response.startswith("```"):
                    clean_response = clean_response[3:]
                if clean_response.endswith("```"):
                    clean_response = clean_response[:-3]
                clean_response = clean_response.strip()

                result = json.loads(clean_response)
                logger.info(f"成功解析课件内容，提取了{len(result.get('knowledge_points', []))}个知识点")
                return result

            except json.JSONDecodeError:
                # 如果JSON解析失败，返回基础结构
                logger.warning("AI响应不是有效的JSON，使用备用解析")
                return {
                    "summary": response[:200],
                    "knowledge_points": [],
                    "key_concepts": [],
                    "difficulty_level": "intermediate",
                    "estimated_study_time": 60,
                    "topics": []
                }

        except Exception as e:
            logger.error(f"课件内容解析失败: {str(e)}")
            raise

    async def generate_questions(
        self,
        content: str,
        knowledge_points: List[str],
        question_config: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        """
        基于课件内容生成题目

        Args:
            content: 课件内容
            knowledge_points: 知识点列表
            question_config: 题目配置，如 {"choice": 5, "fill_blank": 3, "short_answer": 2}

        Returns:
            生成的题目列表
        """
        system_prompt = """你是一个专业的教育题目生成专家。你的任务是基于课件内容生成高质量的各种类型题目。

请严格按照以下JSON格式返回题目：
[
    {
        "type": "choice",
        "question_text": "题目内容",
        "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
        "correct_answer": "A",
        "difficulty": "easy/medium/hard",
        "explanation": "答案解析"
    },
    {
        "type": "fill_blank",
        "question_text": "填空题，用_____表示空缺",
        "correct_answer": "答案",
        "difficulty": "medium",
        "explanation": "答案解析"
    },
    {
        "type": "short_answer",
        "question_text": "简答题题目",
        "reference_answer": "参考答案要点",
        "difficulty": "hard",
        "explanation": "评分标准"
    }
]

要求：
1. 题目要紧扣知识点，难度适中
2. 选择题选项要有干扰性，答案明确
3. 填空题答案要是关键词或核心概念
4. 简答题要能考察学生的理解和应用能力
5. 每道题都要有详细的解析"""

        user_prompt = f"""请基于以下课件内容和知识点生成题目：

知识点：{', '.join(knowledge_points)}

课件内容摘要：
{content[:2000]}

题目要求：
- 选择题：{question_config.get('choice', 0)}道
- 填空题：{question_config.get('fill_blank', 0)}道
- 简答题：{question_config.get('short_answer', 0)}道
- 论述题：{question_config.get('essay', 0)}道

请以JSON数组格式返回所有生成的题目。"""

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            response = await self._call_api(messages, temperature=0.7, max_tokens=3000)

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

                questions = json.loads(clean_response)

                # 验证和标准化题目格式
                validated_questions = []
                for q in questions:
                    if self._validate_question(q):
                        validated_questions.append(self._normalize_question(q))

                logger.info(f"成功生成{len(validated_questions)}道题目")
                return validated_questions

            except json.JSONDecodeError as e:
                logger.error(f"AI响应JSON解析失败: {str(e)}")
                return []

        except Exception as e:
            logger.error(f"题目生成失败: {str(e)}")
            raise

    def _validate_question(self, question: Dict) -> bool:
        """验证题目格式是否正确"""
        required_fields = ["type", "question_text", "correct_answer"]
        return all(field in question for field in required_fields)

    def _normalize_question(self, question: Dict) -> Dict:
        """标准化题目格式"""
        normalized = {
            "type": question.get("type", "choice"),
            "question_text": question.get("question_text", ""),
            "correct_answer": question.get("correct_answer", ""),
            "difficulty": question.get("difficulty", "medium"),
            "explanation": question.get("explanation", ""),
            "options": question.get("options", []),
            "reference_answer": question.get("reference_answer", ""),
        }

        # 根据题目类型添加特定字段
        if normalized["type"] == "choice" and not normalized["options"]:
            normalized["options"] = ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"]
            normalized["correct_answer"] = "A"

        return normalized

    async def check_answer(
        self,
        question: Dict,
        student_answer: str,
        question_type: str
    ) -> Dict[str, Any]:
        """
        AI智能批改答案

        Args:
            question: 题目信息
            student_answer: 学生答案
            question_type: 题目类型

        Returns:
            批改结果，包含分数、反馈、正确答案等
        """
        system_prompt = """你是一个严格但公正的教师。你的任务是批改学生的答案，给出准确的评分和详细的反馈。

请按照以下JSON格式返回批改结果：
{
    "is_correct": true/false,
    "score": 分数（0-100）,
    "feedback": "详细的反馈意见",
    "improvement_suggestions": "改进建议",
    "correct_answer_explanation": "正确答案的详细解释"
}

评分标准：
- 选择题：完全正确100分，错误0分
- 填空题：完全正确100分，部分正确50分，错误0分
- 简答题：根据答案的完整性和准确性给分
- 论述题：根据深度、逻辑性、完整性综合评分"""

        user_prompt = f"""请批改以下答案：

题目类型：{question_type}
题目：{question.get('question_text', '')}
学生答案：{student_answer}
正确答案：{question.get('correct_answer', question.get('reference_answer', ''))}

请给出详细的批改结果和反馈。"""

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            response = await self._call_api(messages, temperature=0.5, max_tokens=1000)

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

                result = json.loads(clean_response)
                logger.info(f"成功批改答案，得分：{result.get('score', 0)}")
                return result

            except json.JSONDecodeError:
                # 如果JSON解析失败，返回基础批改结果
                logger.warning("AI响应不是有效的JSON，使用备用批改")
                return {
                    "is_correct": False,
                    "score": 0,
                    "feedback": response[:200],
                    "improvement_suggestions": "请参考正确答案",
                    "correct_answer_explanation": question.get('explanation', '')
                }

        except Exception as e:
            logger.error(f"答案批改失败: {str(e)}")
            # 返回基础批改结果
            return {
                "is_correct": False,
                "score": 0,
                "feedback": "批改系统暂时不可用",
                "improvement_suggestions": "请稍后重试",
                "correct_answer_explanation": question.get('explanation', '')
            }

    async def generate_learning_recommendation(
        self,
        student_performance: Dict[str, Any],
        course_content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        基于学生表现生成个性化学习建议

        Args:
            student_performance: 学生学习表现数据
            course_content: 课程内容信息

        Returns:
            个性化学习建议
        """
        system_prompt = """你是一个专业的学习顾问。你的任务是基于学生的学习数据和课程内容，生成个性化的学习建议。

请按照以下JSON格式返回建议：
{
    "overall_assessment": "整体学习状况评估",
    "strong_points": ["强项1", "强项2"],
    "weak_points": ["弱项1", "弱项2"],
    "study_suggestions": [
        {
            "priority": "high/medium/low",
            "suggestion": "具体建议",
            "reason": "原因"
        }
    ],
    "recommended_resources": ["推荐资源1", "推荐资源2"],
    "next_steps": ["下一步行动1", "下一步行动2"]
}"""

        user_prompt = f"""请为以下学生生成个性化学习建议：

学生表现数据：
{json.dumps(student_performance, ensure_ascii=False, indent=2)}

课程信息：
{json.dumps(course_content, ensure_ascii=False, indent=2)}

请生成具体、可操作的学习建议。"""

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            response = await self._call_api(messages, temperature=0.6, max_tokens=2000)

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

                result = json.loads(clean_response)
                logger.info("成功生成个性化学习建议")
                return result

            except json.JSONDecodeError:
                logger.warning("AI响应不是有效的JSON，使用备用格式")
                return {
                    "overall_assessment": response[:300],
                    "strong_points": [],
                    "weak_points": [],
                    "study_suggestions": [],
                    "recommended_resources": [],
                    "next_steps": []
                }

        except Exception as e:
            logger.error(f"学习建议生成失败: {str(e)}")
            raise

    async def summarize_discussion(self, discussion_content: str) -> Dict[str, Any]:
        """
        总结讨论内容

        Args:
            discussion_content: 讨论内容

        Returns:
            讨论总结，包括主要观点、共识、争议点等
        """
        system_prompt = """你是一个专业的讨论分析师。你的任务是总结学生讨论内容，提炼关键信息。

请按照以下JSON格式返回总结：
{
    "summary": "讨论摘要（100-200字）",
    "key_points": ["关键观点1", "关键观点2"],
    "consensus": ["共识1", "共识2"],
    "controversies": ["争议点1", "争议点2"],
    "outstanding_questions": ["未解决问题1", "未解决问题2"],
    "participation_level": "high/medium/low"
}"""

        user_prompt = f"""请总结以下讨论内容：

{discussion_content[:3000]}

请提炼关键信息和观点。"""

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            response = await self._call_api(messages, temperature=0.5, max_tokens=1500)

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

                result = json.loads(clean_response)
                logger.info("成功总结讨论内容")
                return result

            except json.JSONDecodeError:
                logger.warning("AI响应不是有效的JSON，使用备用格式")
                return {
                    "summary": response[:300],
                    "key_points": [],
                    "consensus": [],
                    "controversies": [],
                    "outstanding_questions": [],
                    "participation_level": "medium"
                }

        except Exception as e:
            logger.error(f"讨论总结失败: {str(e)}")
            raise


# 创建全局实例
_zhipu_service: Optional[ZhipuAIService] = None


def get_zhipu_service() -> ZhipuAIService:
    """获取智谱AI服务实例"""
    global _zhipu_service
    if _zhipu_service is None:
        from config import settings
        if not settings.ZHIPU_API_KEY:
            raise ValueError("智谱API密钥未配置，请在config.py中设置ZHIPU_API_KEY")
        _zhipu_service = ZhipuAIService(api_key=settings.ZHIPU_API_KEY)
    return _zhipu_service