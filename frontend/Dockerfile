# 前端 Dockerfile
FROM node:22-alpine as builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:22-alpine as production

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制 package 文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 暴露端口
EXPOSE 5173

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["sh", "-c", "npm run preview"]
