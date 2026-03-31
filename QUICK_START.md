# 高校教育平台 - 快速启动指南

## 🚀 一键启动（Docker）

```bash
cd /Users/stevesun/.openclaw/workspace/projects/edu-platform/docker
docker-compose up -d
```

等待 30-60 秒，所有服务将自动启动。

## 📊 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 后端 API | http://localhost:8000 | FastAPI 后端 |
| API 文档 | http://localhost:8000/docs | Swagger UI |
| 前端应用 | http://localhost:3000 | React 前端 |
| MinIO 控制台 | http://localhost:9001 | 对象存储管理 |
| Qdrant 控制台 | http://localhost:6333/dashboard | 向量数据库 |

## 🧪 测试 API

### 1. 注册用户
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "email": "teacher@example.com",
    "password": "password123",
    "full_name": "张老师",
    "role": "teacher"
  }'
```

### 2. 登录获取 Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=teacher1&password=password123"
```

返回：
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### 3. 创建课程
```bash
curl -X POST http://localhost:8000/api/v1/courses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新能源汽车电驱动系统",
    "description": "本课程介绍新能源汽车电驱动系统的原理与应用",
    "category": "新能源汽车",
    "tags": ["新能源汽车", "实践课程"]
  }'
```

### 4. 上传课件
```bash
curl -X POST "http://localhost:8000/api/v1/materials/?course_id=YOUR_COURSE_ID&title=第一章课件" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

### 5. 生成题目（AI）
```bash
curl -X POST "http://localhost:8000/api/v1/questions/material/MATERIAL_ID/generate?choice_count=5&fill_blank_count=3&short_answer_count=2" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. 学生报名课程
```bash
curl -X POST http://localhost:8000/api/v1/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

## 🛠️ 常用命令

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 单个服务
docker-compose logs -f backend
```

### 停止服务
```bash
docker-compose stop
```

### 完全删除（包括数据）
```bash
docker-compose down -v
```

### 重启服务
```bash
docker-compose restart
```

## 📝 前端开发

### 安装依赖
```bash
cd /Users/stevesun/.openclaw/workspace/projects/edu-platform/frontend
npm install antd @ant-design/icons react-router-dom zustand axios
```

### 启动开发服务器
```bash
npm run dev
```

## 🔑 环境变量配置

如需自定义配置，编辑 `backend/.env`：

```bash
cd /Users/stevesun/.openclaw/workspace/projects/edu-platform/backend
cp .env.example .env
nano .env
```

关键配置项：
- `DATABASE_URL`: 数据库连接
- `REDIS_URL`: Redis 连接
- `QDRANT_URL`: 向量数据库地址
- `MINIO_ENDPOINT`: 对象存储地址
- `JWT_SECRET_KEY`: JWT 密钥
- `OPENAI_API_KEY`: OpenAI API Key（可选）

## 🎯 项目完成度

| 模块 | 完成度 | 可用性 |
|------|--------|--------|
| 后端 API | 100% | ✅ 完全可用 |
| 数据库设计 | 100% | ✅ 完全可用 |
| Docker 配置 | 100% | ✅ 完全可用 |
| 前端基础 | 10% | 🚧 需要开发 |
| 前端组件 | 0% | ⏳ 待开发 |

## 📞 问题排查

### 端口已被占用
```bash
# 查看端口占用
lsof -i :8000
lsof -i :3000
lsof -i :5432
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 状态
docker-compose logs postgres
```

### 服务无法启动
```bash
# 查看详细日志
docker-compose logs --tail=100 backend
```

## 💡 下一步

1. **测试 API**: 使用 Swagger UI (http://localhost:8000/docs)
2. **配置 AI**: 添加 OpenAI API Key 以启用 AI 功能
3. **开发前端**: 开始 React 前端开发

---

**祝使用愉快！** 🎉

**预期收入**: 5-20 万/年（按学校收费）
