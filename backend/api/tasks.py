"""
Celery 任务

定义所有后台异步任务
"""
from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)


@shared_task
def update_fund_nav():
    """
    定时更新基金净值

    每天 18:30 执行，从数据源获取最新净值并更新数据库
    """
    try:
        call_command('update_nav')
        logger.info('基金净值更新完成')
        return '净值更新完成'
    except Exception as e:
        logger.error(f'基金净值更新失败: {str(e)}')
        raise
