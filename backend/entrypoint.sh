#!/bin/bash
set -e

echo "=========================================="
echo "  Fundval Backend Starting"
echo "=========================================="

# 等待数据库就绪
echo "Waiting for database..."
while ! pg_isready -h db -U $POSTGRES_USER > /dev/null 2>&1; do
    sleep 1
done
echo "✓ Database ready"

# 运行数据库迁移
echo "Running migrations..."
python manage.py migrate --noinput
echo "✓ Migrations complete"

# 收集静态文件
echo "Collecting static files..."
python manage.py collectstatic --noinput
echo "✓ Static files collected"

# 检查系统初始化状态
echo "=========================================="
python manage.py check_bootstrap
echo "=========================================="

# 启动应用
exec "$@"
