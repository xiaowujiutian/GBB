import React, { useState, useEffect } from 'react';
import {
  Input,
  Card,
  Row,
  Col,
  Tabs,
  List,
  Avatar,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Typography,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  DollarOutlined,
  HistoryOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/user';
import { Order } from '@/types/order';
import { Package } from '@/types/package';
import { Payment } from '@/types/payment';

const { Search } = Input;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

interface SearchResults {
  users: User[];
  orders: Order[];
  packages: Package[];
  payments: Payment[];
}

interface SearchHistory {
  keyword: string;
  count: number;
  timestamp: string;
}

const GlobalSearch: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResults>({
    users: [],
    orders: [],
    packages: [],
    payments: [],
  });
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [hotKeywords] = useState<string[]>([
    '套餐', '用户', '订单', '支付', '退款', 'VIP'
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  };

  const saveSearchHistory = (keyword: string) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const existingIndex = history.findIndex((item: SearchHistory) => item.keyword === keyword);
    
    if (existingIndex >= 0) {
      history[existingIndex].count += 1;
      history[existingIndex].timestamp = new Date().toISOString();
    } else {
      history.unshift({
        keyword,
        count: 1,
        timestamp: new Date().toISOString(),
      });
    }
    
    // 只保留最近20条记录
    const limitedHistory = history.slice(0, 20);
    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
    setSearchHistory(limitedHistory);
  };

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;

    setLoading(true);
    setKeyword(searchKeyword);
    
    try {
      // 模拟API调用 - 实际项目中替换为真实API
      const mockResults: SearchResults = {
        users: [
          {
            id: '1',
            phone: '13800138000',
            nickname: '张三',
            wechatId: 'zhangsan123',
            status: 'active' as any,
            isVip: true,
            vipLevel: 2,
            orderCount: 5,
            totalAmount: 2580,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
          },
        ],
        orders: [
          {
            id: '1',
            orderNo: 'ORD202401001',
            userId: '1',
            packageId: '1',
            timeSlotId: '1',
            status: 'completed' as any,
            totalAmount: 888,
            paidAmount: 888,
            paymentStatus: 'paid' as any,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
          },
        ],
        packages: [
          {
            id: '1',
            name: '经典写真套餐',
            description: '专业摄影服务',
            price: 888,
            duration: 120,
            services: ['化妆', '拍摄'],
            images: [],
            status: 'active' as any,
            isPopular: true,
            orderCount: 100,
            rating: 4.8,
            tags: ['热门'],
            category: '个人写真',
            maxBookings: 5,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
          },
        ],
        payments: [],
      };

      setResults(mockResults);
      saveSearchHistory(searchKeyword);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const getTotalCount = () => {
    return results.users.length + results.orders.length + 
           results.packages.length + results.payments.length;
  };

  const renderUserItem = (user: User) => (
    <List.Item
      actions={[
        <Button type="link" onClick={() => navigate(`/users/${user.id}`)}>
          查看详情
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar src={user.avatar} icon={<UserOutlined />} />}
        title={
          <Space>
            {user.nickname || '未设置'}
            {user.isVip && <Tag color="gold">VIP{user.vipLevel}</Tag>}
          </Space>
        }
        description={
          <div>
            <Text type="secondary">{user.phone}</Text>
            {user.wechatId && <Text type="secondary"> | {user.wechatId}</Text>}
            <br />
            <Text type="secondary">
              订单: {user.orderCount}次 | 消费: ¥{user.totalAmount}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderOrderItem = (order: Order) => (
    <List.Item
      actions={[
        <Button type="link" onClick={() => navigate(`/orders/${order.id}`)}>
          查看详情
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar icon={<ShoppingCartOutlined />} />}
        title={
          <Space>
            {order.orderNo}
            <Tag color="blue">订单</Tag>
          </Space>
        }
        description={
          <div>
            <Text type="secondary">金额: ¥{order.totalAmount}</Text>
            <br />
            <Text type="secondary">
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderPackageItem = (pkg: Package) => (
    <List.Item
      actions={[
        <Button type="link" onClick={() => navigate(`/packages/${pkg.id}`)}>
          查看详情
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar icon={<GiftOutlined />} />}
        title={
          <Space>
            {pkg.name}
            {pkg.isPopular && <Tag color="red" icon={<StarOutlined />}>热门</Tag>}
          </Space>
        }
        description={
          <div>
            <Text type="secondary">¥{pkg.price} | {pkg.duration}分钟</Text>
            <br />
            <Text type="secondary">预订: {pkg.orderCount}次</Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderAllResults = () => (
    <div>
      {results.users.length > 0 && (
        <>
          <Title level={4}>用户 ({results.users.length})</Title>
          <List
            dataSource={results.users.slice(0, 3)}
            renderItem={renderUserItem}
            size="small"
          />
          {results.users.length > 3 && (
            <Button type="link" onClick={() => setActiveTab('users')}>
              查看全部用户结果
            </Button>
          )}
          <Divider />
        </>
      )}

      {results.orders.length > 0 && (
        <>
          <Title level={4}>订单 ({results.orders.length})</Title>
          <List
            dataSource={results.orders.slice(0, 3)}
            renderItem={renderOrderItem}
            size="small"
          />
          {results.orders.length > 3 && (
            <Button type="link" onClick={() => setActiveTab('orders')}>
              查看全部订单结果
            </Button>
          )}
          <Divider />
        </>
      )}

      {results.packages.length > 0 && (
        <>
          <Title level={4}>套餐 ({results.packages.length})</Title>
          <List
            dataSource={results.packages.slice(0, 3)}
            renderItem={renderPackageItem}
            size="small"
          />
          {results.packages.length > 3 && (
            <Button type="link" onClick={() => setActiveTab('packages')}>
              查看全部套餐结果
            </Button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div>
      <Card>
        <Row gutter={24}>
          <Col span={16}>
            <Search
              placeholder="搜索用户、订单、套餐..."
              size="large"
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ marginBottom: 24 }}
            />
          </Col>
        </Row>

        {!keyword && (
          <Row gutter={16}>
            <Col span={12}>
              <Card title="搜索历史" size="small">
                {searchHistory.length > 0 ? (
                  <Space wrap>
                    {searchHistory.slice(0, 10).map((item, index) => (
                      <Button
                        key={index}
                        type="link"
                        icon={<HistoryOutlined />}
                        onClick={() => handleSearch(item.keyword)}
                      >
                        {item.keyword} ({item.count})
                      </Button>
                    ))}
                  </Space>
                ) : (
                  <Empty description="暂无搜索历史" />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="热门搜索" size="small">
                <Space wrap>
                  {hotKeywords.map((word, index) => (
                    <Tag
                      key={index}
                      color="blue"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSearch(word)}
                    >
                      {word}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {keyword && (
          <Spin spinning={loading}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                搜索"{keyword}"，共找到 {getTotalCount()} 条结果
              </Text>
            </div>

            {getTotalCount() === 0 && !loading ? (
              <Empty description="没有找到相关结果" />
            ) : (
              <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab={`全部 (${getTotalCount()})`} key="all">
                  {renderAllResults()}
                </TabPane>
                
                <TabPane tab={`用户 (${results.users.length})`} key="users">
                  <List
                    dataSource={results.users}
                    renderItem={renderUserItem}
                    pagination={results.users.length > 10 ? { pageSize: 10 } : false}
                  />
                </TabPane>

                <TabPane tab={`订单 (${results.orders.length})`} key="orders">
                  <List
                    dataSource={results.orders}
                    renderItem={renderOrderItem}
                    pagination={results.orders.length > 10 ? { pageSize: 10 } : false}
                  />
                </TabPane>

                <TabPane tab={`套餐 (${results.packages.length})`} key="packages">
                  <List
                    dataSource={results.packages}
                    renderItem={renderPackageItem}
                    pagination={results.packages.length > 10 ? { pageSize: 10 } : false}
                  />
                </TabPane>

                <TabPane tab={`支付 (${results.payments.length})`} key="payments">
                  <List
                    dataSource={results.payments}
                    renderItem={(payment) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<DollarOutlined />} />}
                          title={payment.paymentNo}
                          description={`¥${payment.amount}`}
                        />
                      </List.Item>
                    )}
                    pagination={results.payments.length > 10 ? { pageSize: 10 } : false}
                  />
                </TabPane>
              </Tabs>
            )}
          </Spin>
        )}
      </Card>
    </div>
  );
};

export default GlobalSearch;
