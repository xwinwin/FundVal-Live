#!/bin/bash

set -e

echo "🚀 启动 Fundval 基金估值系统..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 复制配置文件（如果不存在）
if [ ! -f backend/config.json ]; then
    echo "📝 创建配置文件..."
    cp backend/config.json.example backend/config.json
fi

# 启动服务
echo "🐳 启动 Docker 容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查健康状态
echo "🔍 检查服务状态..."
if curl -s http://localhost:8000/api/health/ > /dev/null; then
    echo "✅ 后端服务启动成功！"
    echo "📍 后端地址: http://localhost:8000"
    echo "📍 健康检查: http://localhost:8000/api/health/"
else
    echo "❌ 后端服务启动失败，请检查日志："
    echo "   docker-compose logs backend"
    exit 1
fi

# 检查 Celery 服务
echo "🔍 检查 Celery 服务..."
if docker-compose ps celery-worker | grep -q "Up"; then
    echo "✅ Celery Worker 启动成功！"
else
    echo "⚠️  Celery Worker 未启动"
fi

if docker-compose ps celery-beat | grep -q "Up"; then
    echo "✅ Celery Beat 启动成功！"
else
    echo "⚠️  Celery Beat 未启动"
fi

echo ""
echo "🎉 系统启动完成！"
echo ""
echo "服务列表:"
echo "  - 后端 API: http://localhost:8000"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - Celery Worker: 运行中"
echo "  - Celery Beat: 运行中（每天 18:30 更新净值）"
echo ""
echo "查看日志: docker-compose logs -f [service]"
echo "  - 后端: docker-compose logs -f backend"
echo "  - Worker: docker-compose logs -f celery-worker"
echo "  - Beat: docker-compose logs -f celery-beat"
echo ""
echo "停止服务: docker-compose down"
