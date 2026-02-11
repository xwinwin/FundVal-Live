"""
Celery 配置

定时任务系统，用于自动更新基金净值等后台任务
"""
import os
from celery import Celery
from celery.schedules import crontab

# 设置 Django 配置模块
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fundval.settings')

# 创建 Celery 应用
app = Celery('fundval')

# 从 Django settings 加载配置（使用 CELERY_ 前缀）
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现所有已安装应用中的 tasks.py
app.autodiscover_tasks()

# 定时任务配置
app.conf.beat_schedule = {
    'update-fund-nav-daily': {
        'task': 'api.tasks.update_fund_nav',
        'schedule': crontab(hour=18, minute=30),  # 每天 18:30 执行
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """调试任务"""
    print(f'Request: {self.request!r}')
