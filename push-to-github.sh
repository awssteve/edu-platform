#!/bin/bash

# GitHub 用户名（替换为你的用户名）
GITHUB_USERNAME="awssteve"
REPO_NAME="edu-platform"

# 1. 检查是否在正确的目录
cd /Users/stevesun/.openclaw/workspace/projects/edu-platform

# 2. 添加远程仓库
echo "正在添加远程仓库..."
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git 2>/dev/null

# 3. 推送代码到 GitHub
echo "正在推送代码到 GitHub..."
git push -u origin main

# 4. 验证
echo "验证推送..."
git remote show origin
git log --oneline -3

echo "✅ 代码已成功推送到 GitHub！"
echo "📦 仓库地址：https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
