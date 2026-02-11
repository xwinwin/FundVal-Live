import { useState, useEffect } from 'react';
import { Card, Table, Input, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { fundsAPI } from '../api';

const FundsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadFunds = async (searchValue = search, pageNum = page) => {
    setLoading(true);
    try {
      const response = await fundsAPI.list({
        search: searchValue,
        page: pageNum,
        page_size: pageSize,
      });
      setFunds(response.data.results);
      setTotal(response.data.count);
    } catch (error) {
      message.error('加载基金列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
    loadFunds(value, 1);
  };

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    loadFunds(search, pageNum);
  };

  const handleViewDetail = (fundCode) => {
    navigate(`/dashboard/funds/${fundCode}`);
  };

  const handleAddToWatchlist = (fund) => {
    message.info('加入自选功能待实现');
  };

  const columns = [
    {
      title: '代码',
      dataIndex: 'fund_code',
      key: 'fund_code',
      width: 100,
      responsive: ['sm'],
    },
    {
      title: '基金名称',
      dataIndex: 'fund_name',
      key: 'fund_name',
      ellipsis: true,
    },
    {
      title: '昨日净值',
      dataIndex: 'yesterday_nav',
      key: 'yesterday_nav',
      width: 100,
      responsive: ['md'],
      render: (nav) => (nav ? Number(nav).toFixed(4) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.fund_code)}
          />
          <Button
            type="link"
            size="small"
            icon={<StarOutlined />}
            onClick={() => handleAddToWatchlist(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card title="基金列表">
      <Space style={{ width: '100%', marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索基金名称或代码"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              handleSearch('');
            }
          }}
          style={{ width: '100%' }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={funds}
        rowKey="fund_code"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: handlePageChange,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
          simple: window.innerWidth < 768,
        }}
      />
    </Card>
  );
};

export default FundsPage;
