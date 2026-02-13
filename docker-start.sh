#!/bin/bash
set -e

echo "=========================================="
echo "  Fundval - Docker Deployment"
echo "=========================================="
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠ .env file not found, creating from .env.example..."
    cp .env.example .env
    echo "✓ .env created"
    echo ""
    echo "IMPORTANT: Edit .env and set secure passwords before production use!"
    echo ""
fi

# 构建并启动服务
echo "Building and starting services..."
docker-compose up -d --build

echo ""
echo "Waiting for services to be ready..."
sleep 5

# 显示 bootstrap key
echo ""
echo "=========================================="
echo "  Getting Bootstrap Key"
echo "=========================================="
docker-compose logs backend | grep -A 5 "BOOTSTRAP KEY" || echo "Waiting for backend to start..."

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Access the application at: http://localhost"
echo ""
echo "To view bootstrap key:"
echo "  docker-compose logs backend | grep 'BOOTSTRAP KEY'"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f [service]"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
