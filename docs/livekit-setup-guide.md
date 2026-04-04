# LiveKit视频会议集成指南

## 📋 准备工作

### 1. 系统要求
- macOS 或 Linux
- Docker 已安装
- Node.js 16+
- Python 3.8+

### 2. 预估时间
- 部署LiveKit服务器：10分钟
- 后端集成：30分钟
- 前端集成：1小时
- 测试验证：30分钟

**总计：约2-3小时**

---

## 🚀 部署步骤

### **步骤1：部署LiveKit服务器**

```bash
# 1. 进入项目目录
cd /Users/stevesun/.openclaw/workspace/projects/edu-platform

# 2. 运行部署脚本
./deploy-livekit.sh

# 3. 等待服务启动，看到输出：
# ✅ LiveKit服务器已启动！
# 📊 服务状态：livekit-server Up
```

**验证部署**：
```bash
# 检查服务状态
cd livekit-config
docker-compose ps

# 应该看到：
# livekit-server   Up   0.0.0.0:7880->7880/tcp
# livekit-redis    Up   0.0.0.0:6379->6379/tcp
# livekit-admin    Up   0.0.0.0:8080->8080/tcp
```

**访问地址**：
- WebSocket: `ws://localhost:7880`
- 管理面板: `http://localhost:8080`

---

### **步骤2：配置后端**

```bash
# 1. 进入后端目录
cd backend

# 2. 复制LiveKit凭证到.env
cp ../livekit-config/.env .env

# 3. 安装LiveKit SDK
pip3 install livekit

# 4. 注册路由（在main.py中）
```

**编辑 `backend/main.py`**：
```python
from webrtc_signaling import router as webrtc_router
from livekit_service import router as livekit_router

app.include_router(webrtc_router)
app.include_router(livekit_router)  # 添加LiveKit路由
```

**启动后端**：
```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### **步骤3：配置前端**

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装LiveKit客户端SDK
npm install livekit-client

# 3. 在SuperBlackboardFixed.tsx中替换视频会议组件
```

**编辑 `frontend/src/pages/SuperBlackboardFixed.tsx`**：
```typescript
// 导入LiveKit组件
import { LiveKitVideoConference } from '../components/LiveKitVideoConference';

// 在组件中替换
// 旧的：import { VideoConference } from '../components/VideoConference';
// 新的：
const [showLiveKitConference, setShowLiveKitConference] = useState(false);

// 按钮点击
<Tooltip title="视频会议（LiveKit）">
  <Button
    type="primary"
    icon={<VideoCameraOutlined />}
    onClick={() => setShowLiveKitConference(true)}
  >
    视频会议（LiveKit）
  </Button>
</Tooltip>

// Modal
<LiveKitVideoConference
  visible={showLiveKitConference}
  onClose={() => setShowLiveKitConference(false)}
  roomId={currentRoomId}
  userId={user?.id || 'user'}
  username={user?.full_name || 'Guest'}
/>
```

**启动前端**：
```bash
npm run dev
```

---

### **步骤4：测试验证**

#### **测试1：后端API**
```bash
curl -X POST http://localhost:8000/api/v1/video/join-room \
  -H "Content-Type: application/json" \
  -d '{
    "room_name": "test-room",
    "participant_name": "测试用户"
  }'

# 应该返回：
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "url": "ws://localhost:7880",
#   "room_name": "test-room",
#   "participant_name": "测试用户"
# }
```

#### **测试2：前端连接**
1. 打开浏览器：http://localhost:5173/super-blackboard
2. 登录系统
3. 点击"视频会议（LiveKit）"按钮
4. 允许摄像头/麦克风权限
5. 验证：
   - ✅ 本地视频显示
   - ✅ 麦克风/摄像头控制正常
   - ✅ 屏幕共享可用
   - ✅ 控制台无错误

#### **测试3：多用户连接**
1. 打开2个浏览器窗口
2. 使用不同用户登录
3. 加入同一个房间
4. 验证：
   - ✅ 双方都能看到对方
   - ✅ 音视频同步
   - ✅ 延迟<500ms

---

## 🔧 故障排查

### **问题1：LiveKit服务器无法启动**
```bash
# 检查Docker是否运行
docker ps

# 查看日志
cd livekit-config
docker-compose logs livekit

# 重启服务
docker-compose restart
```

### **问题2：前端连接失败**
```bash
# 检查LiveKit服务
curl http://localhost:7880

# 检查凭证
cat livekit-config/.env

# 检查防火墙
lsof -i :7880
```

### **问题3：摄像头无法访问**
```bash
# Safari设置
Safari → 偏好设置 → 网站 → 摄像头 → localhost:5173 → 允许

# Chrome设置
chrome://settings/content/camera
```

---

## 📊 性能验证

### **并发测试**

使用JMeter或k6测试：

```javascript
// k6测试脚本
import http from 'k6/http';

export default function() {
  const response = http.post('http://localhost:8000/api/v1/video/join-room', {
    room_name: 'stress-test',
    participant_name: `user_${__VU}`
  });
}
```

**运行测试**：
```bash
k6 run --vus 50 --duration 30s test.js
```

**预期结果**：
- 10用户：完美运行
- 30用户：流畅运行
- 50用户：可接受（轻微延迟）

---

## 💰 成本估算

### **LiveKit Cloud（托管服务）**
- 免费层：1000分钟/月
- 标准版：$0.004/分钟
- 50人 × 60分钟 × 22天 × $0.004 = **$264/月**

### **自建LiveKit（Docker部署）**
- 服务器（4核8G）：¥500/月
- 带宽（100Mbps）：¥800/月
- **总计：¥1300/月**

### **推荐方案**
- **开发/测试**：LiveKit Cloud免费层
- **小规模生产（<50人）**：自建LiveKit（¥1300/月）
- **大规模生产（>50人）**：LiveKit Cloud或扩容服务器

---

## 🎯 下一步

### **功能增强**
1. **录制功能**：集成LiveKit Recorder
2. **实时字幕**：添加语音识别
3. **白板集成**：与超级黑板联动
4. **断线重连**：添加自动重连机制

### **性能优化**
1. **自适应码率**：根据网络状况调整
2. **服务器监控**：Prometheus + Grafana
3. **负载均衡**：多服务器部署

---

## 📞 技术支持

**官方文档**：
- LiveKit文档：https://docs.livekit.io/
- LiveKit Discord：https://discord.gg/livekit
- GitHub Issues：https://github.com/livekit/livekit/issues

**本地帮助**：
- 查看日志：`cd livekit-config && docker-compose logs -f`
- 管理面板：http://localhost:8080
- API文档：http://localhost:8000/docs

---

## ✅ 部署检查清单

- [ ] LiveKit服务器运行正常
- [ ] 后端API返回有效token
- [ ] 前端可以连接到房间
- [ ] 摄像头/麦克风工作正常
- [ ] 屏幕共享功能正常
- [ ] 多用户可以互相看到/听到
- [ ] 挂断后资源正确释放
- [ ] 控制台无错误信息

全部通过？恭喜，LiveKit集成成功！🎉
