import { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Table,
  Statistic,
  Row,
  Col,
  Radio,
  message,
  Empty,
} from 'antd';
import { accountsAPI, positionsAPI } from '../api';

const PositionsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fundTypeFilter, setFundTypeFilter] = useState('all');

  // 加载账户列表
  const loadAccounts = async () => {
    try {
      const response = await accountsAPI.list();
      const allAccounts = response.data;
      const childAccounts = allAccounts.filter(a => a.parent !== null);

      // 给子账户添加父账户名称
      const childAccountsWithParent = childAccounts.map(child => {
        const parent = allAccounts.find(a => a.id === child.parent);
        return {
          ...child,
          parent_name: parent?.name || '',
        };
      });

      setAccounts(childAccountsWithParent);

      // 默认选中第一个子账户
      if (childAccountsWithParent.length > 0 && !selectedAccountId) {
        setSelectedAccountId(childAccountsWithParent[0].id);
      }
    } catch (error) {
      message.error('加载账户列表失败');
    }
  };

  // 加载持仓列表
  const loadPositions = async (accountId) => {
    if (!accountId) return;

    setLoading(true);
    try {
      const response = await positionsAPI.list(accountId);
      setPositions(response.data);
    } catch (error) {
      message.error('加载持仓列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      loadPositions(selectedAccountId);
    }
  }, [selectedAccountId]);

  // 获取当前选中的账户
  const getSelectedAccount = () => {
    return accounts.find(a => a.id === selectedAccountId);
  };

  // 计算统计数据
  const getStatistics = () => {
    const account = getSelectedAccount();
    if (!account) {
      return {
        holding_cost: '0.00',
        holding_value: '0.00',
        pnl: '0.00',
        pnl_rate: null,
        today_pnl: '0.00',
        today_pnl_rate: null,
      };
    }

    return {
      holding_cost: account.holding_cost || '0.00',
      holding_value: account.holding_value || '0.00',
      pnl: account.pnl || '0.00',
      pnl_rate: account.pnl_rate,
      today_pnl: account.today_pnl || '0.00',
      today_pnl_rate: account.today_pnl_rate,
    };
  };

  // 过滤持仓列表
  const getFilteredPositions = () => {
    if (fundTypeFilter === 'all') {
      return positions;
    }
    return positions.filter(p => {
      const fundType = p.fund_type || '';
      return fundType.includes(fundTypeFilter);
    });
  };

  // 格式化金额
  const formatMoney = (value) => {
    if (value === null || value === undefined) return '-';
    return parseFloat(value).toFixed(2);
  };

  // 格式化百分比
  const formatPercent = (value) => {
    if (value === null || value === undefined) return '-';
    return `${(parseFloat(value) * 100).toFixed(2)}%`;
  };

  const statistics = getStatistics();

  const columns = [
    {
      title: '基金代码',
      dataIndex: 'fund_code',
      key: 'fund_code',
      width: 100,
    },
    {
      title: '基金名称',
      dataIndex: 'fund_name',
      key: 'fund_name',
      width: 200,
    },
    {
      title: '基金类型',
      dataIndex: 'fund_type',
      key: 'fund_type',
      width: 100,
      responsive: ['lg'],
    },
    {
      title: '持有份额',
      dataIndex: 'holding_share',
      key: 'holding_share',
      width: 120,
      render: (value) => formatMoney(value),
    },
    {
      title: '持有成本',
      dataIndex: 'holding_cost',
      key: 'holding_cost',
      width: 120,
      render: (value) => formatMoney(value),
    },
    {
      title: '持仓市值',
      key: 'holding_value',
      width: 120,
      render: (_, record) => {
        const value = parseFloat(record.holding_share || 0) * parseFloat(record.fund?.latest_nav || 0);
        return formatMoney(value);
      },
    },
    {
      title: '盈亏金额',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 120,
      render: (value) => {
        const num = parseFloat(value || 0);
        return (
          <span style={{ color: num >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {formatMoney(value)}
          </span>
        );
      },
    },
    {
      title: '盈亏率',
      key: 'pnl_rate',
      width: 100,
      render: (_, record) => {
        const cost = parseFloat(record.holding_cost || 0);
        const pnl = parseFloat(record.pnl || 0);
        if (cost === 0) return '-';
        const rate = pnl / cost;
        return (
          <span style={{ color: rate >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {formatPercent(rate)}
          </span>
        );
      },
      responsive: ['md'],
    },
    {
      title: '预估市值',
      key: 'estimate_value',
      width: 120,
      render: (_, record) => {
        const estimateNav = record.fund?.estimate_nav;
        if (!estimateNav) return '-';
        const value = parseFloat(record.holding_share || 0) * parseFloat(estimateNav);
        return formatMoney(value);
      },
      responsive: ['lg'],
    },
    {
      title: '预估盈亏',
      key: 'estimate_pnl',
      width: 120,
      render: (_, record) => {
        const estimateNav = record.fund?.estimate_nav;
        if (!estimateNav) return '-';
        const estimateValue = parseFloat(record.holding_share || 0) * parseFloat(estimateNav);
        const pnl = estimateValue - parseFloat(record.holding_cost || 0);
        return (
          <span style={{ color: pnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {formatMoney(pnl)}
          </span>
        );
      },
      responsive: ['xl'],
    },
    {
      title: '今日盈亏',
      key: 'today_pnl',
      width: 120,
      render: (_, record) => {
        const latestNav = record.fund?.latest_nav;
        const estimateNav = record.fund?.estimate_nav;
        if (!latestNav || !estimateNav) return '-';
        const todayPnl = parseFloat(record.holding_share || 0) * (parseFloat(estimateNav) - parseFloat(latestNav));
        return (
          <span style={{ color: todayPnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {formatMoney(todayPnl)}
          </span>
        );
      },
      responsive: ['lg'],
    },
  ];

  if (accounts.length === 0) {
    return (
      <Card title="持仓查询">
        <Empty description="请先创建子账户" />
      </Card>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 300, marginBottom: 16 }}
          placeholder="选择子账户"
          value={selectedAccountId}
          onChange={setSelectedAccountId}
          options={accounts.map(a => ({
            label: `${a.name} (${a.parent_name})`,
            value: a.id,
          }))}
        />

        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="持仓总成本"
              value={statistics.holding_cost}
              prefix="¥"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="持仓总市值"
              value={statistics.holding_value}
              prefix="¥"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总盈亏"
              value={statistics.pnl}
              prefix="¥"
              valueStyle={{ color: parseFloat(statistics.pnl) >= 0 ? '#52c41a' : '#ff4d4f' }}
              suffix={statistics.pnl_rate ? `(${formatPercent(statistics.pnl_rate)})` : ''}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="今日盈亏"
              value={statistics.today_pnl}
              prefix="¥"
              valueStyle={{ color: parseFloat(statistics.today_pnl) >= 0 ? '#52c41a' : '#ff4d4f' }}
              suffix={statistics.today_pnl_rate ? `(${formatPercent(statistics.today_pnl_rate)})` : ''}
            />
          </Col>
        </Row>
      </Card>

      <Card title="持仓列表">
        <Radio.Group
          value={fundTypeFilter}
          onChange={(e) => setFundTypeFilter(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="股票">股票型</Radio.Button>
          <Radio.Button value="债券">债券型</Radio.Button>
          <Radio.Button value="混合">混合型</Radio.Button>
          <Radio.Button value="货币">货币型</Radio.Button>
          <Radio.Button value="其他">其他</Radio.Button>
        </Radio.Group>

        <Table
          columns={columns}
          dataSource={getFilteredPositions()}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: '暂无持仓' }}
        />
      </Card>
    </div>
  );
};

export default PositionsPage;
