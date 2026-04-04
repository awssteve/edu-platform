#!/bin/bash
#
# Git Pre-Commit Security Check
# 防止提交敏感信息到GitHub
#

echo "🔍 运行安全检查..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查结果
ERRORS=0
WARNINGS=0

# 获取暂存的文件
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ 没有暂存的文件"
    exit 0
fi

echo "📁 检查文件:"
echo "$STAGED_FILES" | while read file; do
    echo "  • $file"
done
echo ""

# 1. 检查硬编码的API密钥
echo "🔑 检查API密钥泄漏..."

PATTERNS=(
    "sk-[a-zA-Z0-9]{48}"          # OpenAI API Key
    "sk-ant-[a-zA-Z0-9]{95}"      # Anthropic API Key
    "[0-9a-f]{32}\.[0-9a-f]{32}\.[0-9a-f]{32}"  # 可能的密钥格式
    "password\s*=\s*['\"][^'\"]{10,}['\"]"  # 硬编码密码
    "api[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]"  # API密钥赋值
)

for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        for pattern in "${PATTERNS[@]}"; do
            if git show ":$file" 2>/dev/null | grep -qiE "$pattern"; then
                echo -e "${RED}❌ 发现敏感信息: $file${NC}"
                echo -e "   匹配模式: $pattern"
                ERRORS=$((ERRORS + 1))
            fi
        done
    fi
done

# 2. 检查.env文件
echo ""
echo "🔒 检查环境变量文件..."

for file in $STAGED_FILES; do
    if [[ "$file" == ".env" ]] || [[ "$file" == ".env.local" ]]; then
        echo -e "${RED}❌ 不应提交 .env 文件: $file${NC}"
        echo -e "   请使用 .env.example 作为模板"
        ERRORS=$((ERRORS + 1))
    fi
done

# 3. 检查Python配置文件中的硬编码密钥
echo ""
echo "🐍 检查Python配置文件..."

for file in $STAGED_FILES; do
    if [[ "$file" == *.py ]]; then
        # 检查是否直接赋值API密钥而不是使用os.getenv()
        if git show ":$file" 2>/dev/null | grep -E "API_KEY\s*=\s*['\"][^'\"]{10,}['\"]" > /dev/null; then
            echo -e "${YELLOW}⚠️  可能的硬编码API密钥: $file${NC}"
            echo -e "   建议使用: os.getenv('API_KEY', '')"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done

# 4. 检查大文件
echo ""
echo "📏 检查文件大小..."

MAX_FILE_SIZE=1048576  # 1MB

for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$FILE_SIZE" -gt "$MAX_FILE_SIZE" ]; then
            SIZE_MB=$((FILE_SIZE / 1048576))
            echo -e "${YELLOW}⚠️  大文件: $file (${SIZE_MB}MB)${NC}"
            echo -e "   建议使用 Git LFS"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done

# 5. 检查敏感文件类型
echo ""
echo "🚫 检查敏感文件类型..."

SENSITIVE_PATTERNS=(
    "*.pem"
    "*.key"
    "*.cert"
    "*.p12"
    "*.pfx"
    "id_rsa"
    "*.db"
    "*.sqlite"
    "*.env"
)

for file in $STAGED_FILES; do
    for pattern in "${SENSITIVE_PATTERNS[@]}"; do
        if [[ "$file" == $pattern ]]; then
            echo -e "${RED}❌ 敏感文件类型: $file${NC}"
            echo -e "   这些文件不应提交到Git"
            ERRORS=$((ERRORS + 1))
        fi
    done
done

# 6. 检查config.py中的密钥配置
echo ""
echo "⚙️  检查配置文件..."

for file in $STAGED_FILES; do
    if [[ "$file" == *"config.py" ]]; then
        # 检查API_KEY是否使用os.getenv
        if git show ":$file" 2>/dev/null | grep -E "API_KEY\s*=\s*\"\"" > /dev/null; then
            echo -e "${YELLOW}⚠️  配置文件API_KEY应使用os.getenv(): $file${NC}"
            echo -e "   建议: API_KEY: str = os.getenv('API_KEY', '')"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done

# 汇总
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 检查结果汇总:"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ 发现 $ERRORS 个错误${NC}"
    echo "提交已被阻止，请修复后再试"
    exit 1
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $WARNINGS 个警告${NC}"
    echo "建议修复后再提交，但仍可以继续"
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 安全检查通过！${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
