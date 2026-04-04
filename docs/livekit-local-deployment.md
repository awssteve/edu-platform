# LiveKit本地部署指南（解决网络问题）

## 🔧 方法1：使用Docker镜像代理

### 步骤1：配置Docker镜像加速

**macOS Docker Desktop**：
1. 打开Docker Desktop
2. 点击Settings (齿轮图标)
3. 点击Docker Engine
4. 添加以下配置：
```json
{
  "registry-mirrors": [
    "https://docker.m.azuredocker.cn",
    "https://dockerproxy.com"
  ]
}
```
5. 点击"Apply & Restart"

### 步骤2：重新拉取镜像
```bash
cd /Users/stevesun/.openclaw/workspace/projects/edu-platform/livekit-config
docker-compose pull
docker-compose up -d
```

---

## 🔧 方法2：手动安装LiveKit（推荐用于开发测试）

### 步骤1：下载LiveKit服务器
```bash
# macOS Intel
curl -L https://github.com/livekit/livekit/releases/download/v1.5.0/livekit_1.5.0_darwin_amd64.tar.gz -o livekit.tar.gz

# macOS Apple Silicon (M1/M2)
curl -L https://github.com/livekit/livekit/releases/download/v1.5.0/livekit_1.5.0_darwin_arm64.tar.gz -o livekit.tar.gz

# 解压
tar -xzf livekit.tar.gz
cd livekit_1.5.0_darwin_*
```

### 步骤2：创建配置文件
```bash
cat > livekit.yaml << 'EOF'
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
keys:
  devkey: secretsecret
redis:
  address: localhost:6379
EOF
```

### 步骤3：启动Redis（用Docker）
```bash
docker run -d --name livekit-redis -p 6379:6379 redis:7-alpine
```

### 步骤4：启动LiveKit
```bash
./livekit-server --config livekit.yaml
```

---

## 🔧 方法3：使用LiveKit CLI（最简单）

### 步骤1：安装LiveKit CLI
```bash
# macOS
brew install livekit
```

### 步骤2：创建配置文件
```bash
mkdir -p ~/livekit
cd ~/livekit
cat > livekit.yaml << 'EOF'
port: 7880
keys:
  devkey: secretsecret
EOF
```

### 步骤3：启动服务器
```bash
livekit-server --config livekit.yaml
```

---

## ✅ 验证部署

### 检查服务状态
```bash
# 检查LiveKit端口
lsof -i :7880

# 检查Redis
docker ps | grep redis

# 测试WebSocket
wscat -c ws://localhost:7880
```

### 访问管理面板
```
http://localhost:7880/dashboard
（如果安装了livekit-admin）
```

---

## 🎯 推荐方法

**对于你的情况（macOS + 网络问题）**：

**最快方案**：方法2（手动安装）
1. 下载二进制文件
2. 配置livekit.yaml
3. 启动服务

**总耗时**：15-20分钟

---

## 📝 配置后端

部署成功后，更新 `backend/.env`：
```bash
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secretsecret
LIVEKIT_URL=ws://localhost:7880
```

---

## 🚀 下一步

部署完成后：
1. ✅ 后端已经配置好
2. ✅ 安装前端依赖：`npm install livekit-client`
3. ✅ 测试API连接
4. ✅ 集成到超级黑板

---

## ⚠️ 如果仍然遇到问题

**替代方案**：使用简化版WebRTC
- 保持当前P2P实现（2-4人）
- 优化代码质量
- 添加录制功能（客户端侧）

这已经能满足小班教学需求。
