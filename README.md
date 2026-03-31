# 高校教育平台 - AI 智慧教学新生态

> 人机协同 + 项目驱动的职业教育智慧教学平台

## 📋 项目概述

这是一个完整的智慧教育平台，支持教师上传课件、AI 自动生成题目、学生在线学习、智能批改等核心功能。

## 🚀 快速开始

### 前置要求

- Docker & Docker Compose
- Python 3.12+
- Node.js 22.x+

### 使用 Docker 启动（推荐）

```bash
cd docker
docker-compose up -d
```

这将启动以下服务：
- PostgreSQL (5432)
- Redis (6379)
- Qdrant (6333) - 向量数据库
- MinIO (9000) - 对象存储
- Backend API (8000)
- Frontend (3000)

### 手动启动

#### 后端

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 前端

```bash
cd frontend
npm install
npm run dev
```

## 📚 API 文档

启动后端服务后，访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🏗️ 项目结构

```
edu-platform/
├── backend/              # FastAPI 后端
│   ├── main.py          # 应用入口
│   ├── config.py        # 配置
│   ├── database.py      # 数据库连接
│   ├── models/          # SQLAlchemy 模型
│   ├── schemas/         # Pydantic schemas
│   ├── routers/         # API 路由
│   └── requirements.txt # Python 依赖
├── frontend/            # React 前端
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/      # 页面
│   │   └── App.tsx
│   └── package.json
├── docker/              # Docker 配置
│   └── docker-compose.yml
└── README.md
```

## 🔑 环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cd backend
cp .env.example .env
```

必需配置：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `REDIS_URL`: Redis 连接字符串
- `QDRANT_URL`: Qdrant 向量数据库地址
- `MINIO_ENDPOINT`: MinIO 对象存储地址
- `JWT_SECRET_KEY`: JWT 密钥
- AI 模型 API Key（可选，用于 AI 功能）

## 🎯 核心功能

### 教师端
- ✅ 课程管理
- ✅ 课件上传（PDF/PPT/Word/视频）
- ✅ AI 自动生成题目
- ✅ 作业创建与发布
- ✅ 学生学习分析
- ✅ 讨论区管理
- ✅ 证书颁发

### 学生端
- ✅ 课程浏览与报名
- ✅ 在线学习（视频/PPT/文档）
- ✅ 在线答题
- ✅ 学习进度跟踪
- ✅ 讨论区互动
- ✅ 学习证书

### AI 功能
- ✅ 课件解析与知识点提取
- ✅ 题目自动生成
- ✅ 智能批改
- ✅ 学习推荐

## 🛠️ 技术栈

### 后端
- **框架**: FastAPI 0.104
- **数据库**: PostgreSQL 15 + SQLAlchemy 2.0
- **缓存**: Redis 7
- **向量数据库**: Qdrant
- **对象存储**: MinIO
- **AI**: OpenAI / Claude / 智谱 GLM-4

### 前端
- **框架**: React 18 + TypeScript
- **路由**: React Router v6
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **HTTP 客户端**: Axios

## 📊 数据库设计

核心表：
- `users` - 用户表
- `schools` - 学校表
- `courses` - 课程表
- `course_materials` - 课件表
- `questions` - 题目表
- `assignments` - 作业表
- `student_submissions` - 学生答题记录
- `learning_progress` - 学习进度
- `discussion_topics` - 讨论主题
- `certificates` - 证书表

详细设计见 `docs/database-design.md`

## 🔐 安全

- JWT 认证
- RBAC 权限控制
- 密码加密（bcrypt）
- CORS 配置
- SQL 注入防护

## 🧪 测试

```bash
# 后端测试
cd backend
pytest

# 前端测试
cd frontend
npm test
```

## 📦 部署

### Docker 部署

```bash
docker-compose up -d
```

### 手动部署

见 `docs/deployment.md`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Green - 赚钱 AI 助手

---

💰 **预期收入**: 按学校年费（5-20 万）或按课时收费（5千-2 万/学期）
