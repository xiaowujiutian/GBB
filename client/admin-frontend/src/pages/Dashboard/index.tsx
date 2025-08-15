import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  List,
  Avatar,
  Progress,
  Space,
  Button,
} from 'antd';
import {
  ArrowUpOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';
import { Order, OrderStats } from '@/types/order';
import { UserStats } from '@/types/user';
import { PackageStats } from '@/types/package';
import { orderService } from '@/services/orders';
import { userService } from '@/services/users';
import './Dashboard.css';

interface OrderTrendData {
  date: string;
  orders: number;
  revenue: number;
}

interface DashboardData {
  userStats: UserStats;
  orderStats: OrderStats;
  packageStats: PackageStats;
  recentOrders: Order[];
  orderTrends: OrderTrendData[];
}

interface TodoItem {
  title: string;
  count: number;
  type: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      vipUsers: 0,
      growthRate: 0,
    },
    orderStats: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      conversionRate: 0,
    },
    packageStats: {
      totalPackages: 0,
      activePackages: 0,
      popularPackages: 0,
      avgPrice: 0,
      totalBookings: 0,
      topSellingPackage: {
        name: '',
        bookings: 0,
      },
    },
    recentOrders: [],
    orderTrends: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [userStats, orderStats, orderTrends, recentOrders] = await Promise.all([
        userService.getUserStats(),
        orderService.getOrderStats(),
        orderService.getOrderTrends('7d'),
        orderService.getOrders({ page: 1, pageSize: 10 }),
      ]);

      setData({
        userStats: userStats.data,
        orderStats: orderStats.data,
        packageStats: {
          totalPackages: 0,
          activePackages: 0,
          popularPackages: 0,
          avgPrice: 0,
          totalBookings: 0,
          topSellingPackage: { name: '', bookings: 0 },
        },
        recentOrders: recentOrders.data.list,
        orderTrends: orderTrends.data,
      });
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 订单趋势图表配置
  const orderTrendOption = {
    title: {
      text: '订单趋势',
      left: 'left',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.orderTrends.map(item => item.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '订单数量',
        type: 'line',
        data: data.orderTrends.map(item => item.orders),
        smooth: true,
        itemStyle: {
          color: '#1890ff',
        },
      },
      {
        name: '收入',
        type: 'line',
        data: data.orderTrends.map(item => item.revenue),
        smooth: true,
        itemStyle: {
          color: '#52c41a',
        },
      },
    ],
  };

  // 最近订单表格列配置
  const orderColumns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 150,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '用户',
      dataIndex: ['user', 'phone'],
    },
    {
      title: '套餐',
      dataIndex: ['package', 'name'],
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'orange', text: '待确认' },
          confirmed: { color: 'blue', text: '已确认' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
  ];

  // 待处理事项数据
  const todoItems: TodoItem[] = [
    {
      title: '待确认订单',
      count: data.orderStats.pendingOrders,
      type: 'warning',
    },
    {
      title: '今日新用户',
      count: data.userStats.newUsersToday,
      type: 'info',
    },
    {
      title: '活跃套餐',
      count: data.packageStats.activePackages,
      type: 'success',
    },
  ];

  return (
    <div className="dashboard-container">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={data.userStats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: 12 }}>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  {data.userStats.growthRate}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={data.orderStats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={data.orderStats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={data.orderStats.todayOrders}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表和数据 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="订单趋势" loading={loading}>
            <ReactECharts
              option={orderTrendOption}
              style={{ height: '300px' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="关键指标">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8 }}>转化率</div>
                <Progress
                  percent={data.orderStats.conversionRate}
                  status="active"
                  strokeColor="#1890ff"
                />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>VIP用户占比</div>
                <Progress
                  percent={(data.userStats.vipUsers / data.userStats.totalUsers) * 100}
                  strokeColor="#52c41a"
                />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>订单完成率</div>
                <Progress
                  percent={(data.orderStats.completedOrders / data.orderStats.totalOrders) * 100}
                  strokeColor="#722ed1"
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最近订单和活动用户 */}
      <Row gutter={16}>
        <Col span={16}>
          <Card
            title="最近订单"
            loading={loading}
            extra={<Button type="link">查看全部</Button>}
          >
            <Table
              columns={orderColumns}
              dataSource={data.recentOrders}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="待处理事项">
            <List
              itemLayout="horizontal"
              dataSource={todoItems}
              renderItem={(item: TodoItem) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.title}
                    description={`${item.count} 项`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
