# 🔒 Git提交安全检查指南

## 概述

为了防止敏感信息（API密钥、密码等）被意外提交到GitHub，项目配置了自动安全检查机制。

---

## ✅ 已修复的配置问题

### 2026-04-04 修复

**问题：** backend/config.py 中的AI服务API密钥配置不一致

```python
# ❌ 修复前（硬编码空字符串，无法从环境变量读取）
OPENAI_API_KEY: str = ""
ANTHROPIC_API_KEY: str = ""
ZHIPU_API_KEY: str = ""

# ✅ 修复后（从环境变量读取）
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
ZHIPU_API_KEY: str = os.getenv("ZHIPU_API_KEY", "")
```

---

## 🔍 自动安全检查

### 检查项目

1. **API密钥泄漏检测**
   - OpenAI API Key (`sk-...`)
   - Anthropic API Key (`sk-ant-...`)
   - 智谱AI密钥格式
   - 其他硬编码的密钥

2. **环境变量文件**
   - 禁止提交 `.env`
   - 禁止提交 `.env.local`
   - 允许提交 `.env.example`

3. **Python配置检查**
   - 检测硬编码的API密钥赋值
   - 建议使用 `os.getenv()`

4. **文件大小检查**
   - 警告超过1MB的文件
   - 建议使用Git LFS

5. **敏感文件类型**
   - 证书文件 (*.pem, *.key, *.cert)
   - 密钥文件 (id_rsa)
   - 数据库文件 (*.db, *.sqlite)
   - 环境变量文件 (*.env)

---

## 🚀 安装Pre-Commit Hook

### 方法1：自动安装（推荐）

```bash
# 复制hook到git目录
cp .github/hooks/pre-commit-security-check.sh .git/hooks/pre-commit

# 设置可执行权限
chmod +x .git/hooks/pre-commit

# 验证安装
ls -la .git/hooks/pre-commit
```

### 方法2：手动安装

```bash
# 创建符号链接
ln -s ../../.github/hooks/pre-commit-security-check.sh .git/hooks/pre-commit
```

---

## 📝 使用方法

### 每次提交时自动运行

安装hook后，每次`git commit`都会自动运行安全检查：

```bash
git add .
git commit -m "feat: 新功能"
# 🔍 运行安全检查...
# ✅ 安全检查通过！
```

### 手动运行检查

如果需要手动运行检查（不安装hook）：

```bash
# 检查当前暂存的文件
.github/hooks/pre-commit-security-check.sh

# 或者使用git hooks
git hooks run pre-commit
```

---

## ⚠️ 检查失败处理

### 错误级别

**❌ 错误（阻止提交）：**
- 发现API密钥泄漏
- 提交了.env文件
- 提交了敏感文件类型

**⚠️ 警告（允许继续）：**
- 可能的硬编码密钥
- 大文件警告
- 配置文件改进建议

### 修复示例

**问题：**
```bash
❌ 发现敏感信息: backend/config.py
   匹配模式: password\s*=\s*['\"][^'\"]{10,}['\""]
提交已被阻止
```

**解决方案：**
1. 移除硬编码的敏感信息
2. 使用环境变量替代
3. 提交到 `.gitignore`

---

## 🔐 环境变量配置

### 正确的配置流程

1. **创建环境变量文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑.env文件，填入真实的API密钥**
   ```bash
   ZHIPU_API_KEY=your_actual_api_key_here
   ```

3. **确保.env在.gitignore中**
   ```bash
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

4. **提交.env.example作为模板**
   ```bash
   git add .env.example
   git commit -m "chore: 添加环境变量示例"
   ```

---

## 📋 提交前检查清单

每次提交代码前，请确认：

- [ ] ✅ 已检查没有硬编码的API密钥
- [ ] ✅ `.env` 文件不在提交列表中
- [ ] ✅ 敏感文件已添加到 `.gitignore`
- [ ] ✅ 配置文件使用 `os.getenv()` 读取密钥
- [ ] ✅ 没有提交测试密钥或临时密钥
- [ ] ✅ 大文件已使用Git LFS处理

---

## 🛠️ 故障排除

### Hook未运行

**症状：** 提交时没有看到安全检查提示

**解决：**
```bash
# 检查hook是否存在
ls -la .git/hooks/pre-commit

# 检查权限
chmod +x .git/hooks/pre-commit

# 手动测试
.github/hooks/pre-commit-security-check.sh
```

### 需要跳过检查（不推荐）

**紧急情况：** 确认需要跳过检查

```bash
# 使用--no-verify标志（谨慎使用）
git commit --no-verify -m "紧急修复"
```

⚠️ **警告：** 跳过检查可能导致敏感信息泄漏！

---

## 📚 相关文档

- [环境变量配置](../.env.example)
- [配置文件说明](../backend/config.py)
- [Git安全最佳实践](https://github.com/github/gitignore)

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2026-04-04 | v1.0.0 | 初始版本，修复API密钥配置问题 |
| | | 添加自动化安全检查脚本 |
| | | 创建配置指南 |

---

**维护者：** 项目团队
**最后更新：** 2026-04-04
