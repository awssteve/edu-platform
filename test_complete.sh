#!/bin/bash

echo "========================================"
echo "   高校教育平台 - 完整功能测试"
echo "========================================"
echo ""

API_BASE="http://localhost:8000"
FRONTEND_BASE="http://localhost:5174"

# 测试结果数组
declare -a TEST_RESULTS
declare -a TEST_ERRORS

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local test_name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=$5
    
    echo -n "测试 $test_name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" -H "Content-Type: application/json" -H "Origin: $FRONTEND_BASE")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" -H "Content-Type: application/json" -H "Origin: $FRONTEND_BASE" -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ 通过${NC} (HTTP $http_code)"
        TEST_RESULTS+=("$test_name:通过")
        echo "   响应: $body"
    else
        echo -e "${RED}❌ 失败${NC} (HTTP $http_code, 预期 $expected_status)"
        TEST_RESULTS+=("$test_name:失败")
        TEST_ERRORS+=("$test_name: 预期 $expected_status, 实际 $http_code")
        echo "   响应: $body"
    fi
    echo ""
}

echo "========================================"
echo "   后端服务测试"
echo "========================================"
echo ""

# 测试 1: 健康检查
test_api "健康检查" "GET" "$API_BASE/health" "" "200"

# 测试 2: 用户注册
test_api "用户注册-1" "POST" "$API_BASE/api/v1/auth/register" \
    '{"username": "用户A", "email": "usera@example.com", "full_name": "用户A", "role": "student"}' \
    "201"

# 测试 3: 用户注册（重复邮箱）
test_api "用户注册-重复邮箱" "POST" "$API_BASE/api/v1/auth/register" \
    '{"username": "userB", "email": "usera@example.com", "full_name": "用户B", "role": "student"}' \
    "400"

# 测试 4: 用户注册（重复用户名）
test_api "用户注册-重复用户名" "POST" "$API_BASE/api/v1/auth/register" \
    '{"username": "用户A", "email": "userb@example.com", "full_name": "用户B", "role": "student"}' \
    "400"

# 测试 5: 获取用户列表
test_api "获取用户列表" "GET" "$API_BASE/api/v1/users" "" "200"

echo "========================================"
echo "   前后端协同测试"
echo "========================================"
echo ""

# 测试 6: 前端调用后端 - 注册
test_api "前端调用后端-注册" "POST" "$API_BASE/api/v1/auth/register" \
    '{"username": "前端用户", "email": "frontend@example.com", "full_name": "前端用户", "role": "teacher"}' \
    "201"

# 测试 7: 前端调用后端 - 获取用户
test_api "前端调用后端-获取用户" "GET" "$API_BASE/api/v1/users" "" "200"

echo "========================================"
echo "   测试结果汇总"
echo "========================================"
echo ""

passed_count=0
failed_count=0

for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == *"通过"* ]]; then
        ((passed_count++))
    else
        ((failed_count++))
    fi
    echo -e "  $result"
done

echo ""
echo "总计测试: $((passed_count + failed_count))"
echo -e "通过: ${GREEN}$passed_count${NC}"
echo -e "失败: ${RED}$failed_count${NC}"

if [ $failed_count -gt 0 ]; then
    echo ""
    echo -e "${RED}失败详情:${NC}"
    for error in "${TEST_ERRORS[@]}"; do
        echo -e "  ${RED}❌ $error${NC}"
    done
fi

echo ""
echo "========================================"
echo "   服务状态"
echo "========================================"
echo ""

# 检查服务状态
echo -n "后端服务 ($API_BASE)... "
backend_status=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health")
if [ "$backend_status" = "200" ]; then
    echo -e "${GREEN}✅ 运行中${NC}"
else
    echo -e "${RED}❌ 离线${NC}"
fi

echo -n "前端服务 ($FRONTEND_BASE)... "
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_BASE")
if [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}✅ 运行中${NC}"
else
    echo -e "${RED}❌ 离线${NC}"
fi

echo ""
echo "========================================"
echo "   测试完成时间"
echo "========================================"
echo ""

date

if [ $failed_count -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！前后端协同正常工作！${NC}"
    exit 0
else
    echo -e "${RED}❌ 有 $failed_count 个测试失败，请检查${NC}"
    exit 1
fi
