"""
LiveKit视频会议服务
Video conference service using LiveKit
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging
from datetime import datetime
import os
from livekit.api import AccessToken
from livekit.api.access_token import VideoGrants

logger = logging.getLogger(__name__)

router = APIRouter()


class LiveKitConfig:
    """LiveKit配置"""

    def __init__(self):
        # 使用与LiveKit服务器相同的密钥
        self.api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
        self.api_secret = os.getenv("LIVEKIT_API_SECRET", "devsecretsecretsecretsecretsecretsecretsecretse")
        self.url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")

        if not self.api_key or not self.api_secret:
            logger.warning("LiveKit credentials not configured")


config = LiveKitConfig()


class JoinRoomRequest(BaseModel):
    """加入房间请求"""
    room_name: str
    participant_name: str
    metadata: Optional[str] = None


class JoinRoomResponse(BaseModel):
    """加入房间响应"""
    token: str
    url: str
    room_name: str
    participant_name: str


class RoomInfo(BaseModel):
    """房间信息"""
    room_name: str
    participant_count: int
    created_at: str


@router.post("/api/v1/video/join-room", response_model=JoinRoomResponse)
async def join_room(request: JoinRoomRequest):
    """
    加入视频房间
    生成LiveKit访问令牌
    """
    if not config.api_key or not config.api_secret:
        raise HTTPException(
            status_code=500,
            detail="LiveKit未配置，请联系管理员"
        )

    try:
        # 创建访问令牌
        token = AccessToken(config.api_key, config.api_secret)

        # 添加权限
        grants = VideoGrants(
            room_join=True,
            room=request.room_name,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        )

        token.with_grants(grants)

        # 设置参与者信息
        token.with_identity(request.participant_name)
        token.with_name(request.participant_name)
        token.with_metadata(request.metadata or "")

        # 生成JWT令牌
        jwt_token = token.to_jwt()

        logger.info(
            f"用户 {request.participant_name} 加入房间 {request.room_name}"
        )

        return JoinRoomResponse(
            token=jwt_token,
            url=config.url,
            room_name=request.room_name,
            participant_name=request.participant_name
        )

    except Exception as e:
        logger.error(f"生成LiveKit令牌失败: {e}")
        raise HTTPException(status_code=500, detail=f"无法加入房间: {str(e)}")


@router.post("/api/v1/video/create-room")
async def create_room(room_name: str, max_participants: int = 50):
    """
    创建新房间
    """
    # LiveKit会在首次访问时自动创建房间
    # 这里只是记录房间信息
    logger.info(f"创建房间: {room_name}, 最大人数: {max_participants}")

    return {
        "success": True,
        "room_name": room_name,
        "max_participants": max_participants,
        "created_at": datetime.now().isoformat()
    }


@router.get("/api/v1/video/rooms/{room_name}/info")
async def get_room_info(room_name: str):
    """
    获取房间信息
    """
    # 这里可以连接到LiveKit服务器查询实际信息
    # 现在返回基础信息
    return {
        "room_name": room_name,
        "participant_count": 0,  # 需要从LiveKit查询
        "status": "active"
    }


@router.delete("/api/v1/video/rooms/{room_name}/participant/{participant_name}")
async def remove_participant(room_name: str, participant_name: str):
    """
    移除参与者
    """
    # 需要通过LiveKit REST API调用
    logger.info(f"移除参与者: {participant_name} from {room_name}")

    return {"success": True}


class RecordingRequest(BaseModel):
    """录制请求"""
    room_name: str
    participant_name: str


@router.post("/api/v1/video/start-recording")
async def start_recording(request: RecordingRequest):
    """
    开始录制房间
    """
    # LiveKit支持录制功能
    # 需要配置录制存储（S3、Azure Blob等）
    logger.info(f"开始录制房间: {request.room_name}")

    return {
        "success": True,
        "recording_id": f"rec_{datetime.now().timestamp()}",
        "status": "recording"
    }


@router.post("/api/v1/video/stop-recording")
async def stop_recording(recording_id: str):
    """
    停止录制
    """
    logger.info(f"停止录制: {recording_id}")

    return {
        "success": True,
        "recording_id": recording_id,
        "status": "stopped"
    }
