"""
WebRTC信令服务器
WebSocket Signaling Server for WebRTC
功能：房间管理、用户连接、信令交换
"""

from fastapi import WebSocket, WebSocketDisconnect, APIRouter, HTTPException
from typing import Dict, Set, List
import json
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """WebRTC连接管理器"""

    def __init__(self):
        # 房间列表: {room_id: {user_id: websocket}}
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}
        # 用户信息: {user_id: {username, room_id, joined_at}}
        self.users: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, username: str):
        """用户连接到房间"""
        # 注意：websocket.accept() 已经在调用此方法之前完成了

        # 创建房间（如果不存在）
        if room_id not in self.rooms:
            self.rooms[room_id] = {}
            logger.info(f"创建新房间: {room_id}")

        # 添加用户到房间
        self.rooms[room_id][user_id] = websocket

        # 记录用户信息
        self.users[user_id] = {
            "username": username,
            "room_id": room_id,
            "joined_at": datetime.now().isoformat(),
            "websocket": websocket
        }

        logger.info(f"用户 {username}({user_id}) 加入房间 {room_id}")

        # 通知房间内其他用户
        await self.broadcast_to_room(
            room_id=room_id,
            message={
                "type": "user-joined",
                "user_id": user_id,
                "username": username,
                "timestamp": datetime.now().isoformat()
            },
            exclude_user_id=user_id
        )

        # 发送当前房间用户列表给新用户
        room_users = self.get_room_users(room_id)
        await websocket.send_json({
            "type": "room-users",
            "users": room_users,
            "room_id": room_id
        })

    def disconnect(self, user_id: str):
        """用户断开连接"""
        if user_id not in self.users:
            return

        user_info = self.users[user_id]
        room_id = user_info["room_id"]
        username = user_info["username"]

        # 从房间移除
        if room_id in self.rooms and user_id in self.rooms[room_id]:
            del self.rooms[room_id][user_id]

            # 如果房间空了，删除房间
            if not self.rooms[room_id]:
                del self.rooms[room_id]
                logger.info(f"房间 {room_id} 已删除（无人）")

        # 删除用户信息
        del self.users[user_id]

        logger.info(f"用户 {username}({user_id}) 离开房间 {room_id}")

        return room_id, username

    async def broadcast_to_room(
        self,
        room_id: str,
        message: dict,
        exclude_user_id: str = None
    ):
        """向房间内所有用户广播消息"""
        if room_id not in self.rooms:
            return

        for user_id, websocket in self.rooms[room_id].items():
            # 排除指定用户
            if exclude_user_id and user_id == exclude_user_id:
                continue

            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"发送消息给用户 {user_id} 失败: {e}")

    async def send_to_user(self, user_id: str, message: dict):
        """向指定用户发送消息"""
        if user_id in self.users:
            websocket = self.users[user_id]["websocket"]
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"发送消息给用户 {user_id} 失败: {e}")

    def get_room_users(self, room_id: str) -> List[dict]:
        """获取房间用户列表"""
        if room_id not in self.rooms:
            return []

        users = []
        for user_id in self.rooms[room_id]:
            if user_id in self.users:
                users.append({
                    "user_id": user_id,
                    "username": self.users[user_id]["username"],
                    "joined_at": self.users[user_id]["joined_at"]
                })
        return users

    def get_room_info(self, room_id: str) -> dict:
        """获取房间信息"""
        users = self.get_room_users(room_id)
        return {
            "room_id": room_id,
            "user_count": len(users),
            "users": users
        }


# 全局连接管理器
manager = ConnectionManager()


@router.get("/rooms/{room_id}/info")
async def get_room_info(room_id: str):
    """获取房间信息"""
    room_info = manager.get_room_info(room_id)
    if not room_info["users"]:
        raise HTTPException(status_code=404, detail="房间不存在")

    return {
        "success": True,
        "room": room_info
    }


@router.websocket("/ws/signaling")
async def websocket_signaling(websocket: WebSocket):
    """
    WebSocket信令端点
    处理WebRTC的信令交换
    """
    # 立即接受连接（重要！必须在检查Origin之前）
    await websocket.accept()

    # 检查Origin（已连接后检查）
    origin = websocket.headers.get('origin')

    # 允许所有本地开发环境
    if origin:
        is_allowed = any([
            origin.startswith('http://localhost'),
            origin.startswith('http://127.0.0.1'),
            origin == 'null'
        ])

        if not is_allowed:
            logger.warning(f"WebSocket连接来自不被允许的Origin: {origin}，但本地开发允许")
            # 不关闭连接，继续处理（本地开发友好）

    try:
        # 等待连接消息
        init_message = await websocket.receive_json()

        if init_message.get("type") != "join-room":
            await websocket.close(code=4000, reason="First message must be join-room")
            return

        room_id = init_message.get("room_id")
        user_id = init_message.get("user_id") or str(uuid.uuid4())
        username = init_message.get("username", "Anonymous")

        # 连接用户
        await manager.connect(websocket, room_id, user_id, username)

        # 处理后续消息
        while True:
            try:
                message = await websocket.receive_json()
                message_type = message.get("type")

                # WebRTC信令消息
                if message_type in ["offer", "answer", "ice-candidate"]:
                    # 转发给目标用户
                    target_user_id = message.get("target_user_id")
                    if target_user_id:
                        await manager.send_to_user(target_user_id, {
                            "type": message_type,
                            "sender_id": user_id,
                            "sender_name": username,
                            "data": message.get("data")
                        })

                # 屏幕共享
                elif message_type == "start-screen-share":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "user-screen-sharing",
                            "user_id": user_id,
                            "username": username,
                            "action": "started"
                        },
                        exclude_user_id=user_id
                    )

                elif message_type == "stop-screen-share":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "user-screen-sharing",
                            "user_id": user_id,
                            "action": "stopped"
                        },
                        exclude_user_id=user_id
                    )

                # 媒体控制
                elif message_type == "mute-audio":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "user-media-state",
                            "user_id": user_id,
                            "media": "audio",
                            "enabled": False
                        }
                    )

                elif message_type == "unmute-audio":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "user-media-state",
                            "user_id": user_id,
                            "media": "audio",
                            "enabled": True
                        }
                    )

                elif message_type == "mute-video":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "user-media-state",
                            "user_id": user_id,
                            "media": "video",
                            "enabled": False
                        }
                    )

                elif message_type == "unmute-video":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "user-media-state",
                            "user_id": user_id,
                            "media": "video",
                            "enabled": True
                        }
                    )

                # 聊天消息
                elif message_type == "chat-message":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "chat-message",
                            "user_id": user_id,
                            "username": username,
                            "message": message.get("message"),
                            "timestamp": datetime.now().isoformat()
                        }
                    )

                # 白板同步
                elif message_type == "whiteboard-data":
                    await manager.broadcast_to_room(
                        room_id=room_id,
                        message={
                            "type": "whiteboard-sync",
                            "user_id": user_id,
                            "data": message.get("data")
                        },
                        exclude_user_id=user_id
                    )

                else:
                    logger.warning(f"未知消息类型: {message_type}")

            except json.JSONDecodeError:
                logger.error("收到无效的JSON消息")
                continue

    except WebSocketDisconnect:
        # 用户断开连接
        room_id, username = manager.disconnect(user_id)

        # 通知其他用户
        if room_id:
            await manager.broadcast_to_room(
                room_id=room_id,
                message={
                    "type": "user-left",
                    "user_id": user_id,
                    "username": username,
                    "timestamp": datetime.now().isoformat()
                }
            )

    except Exception as e:
        logger.error(f"WebSocket错误: {e}")
        await websocket.close(code=4000, reason=str(e))
