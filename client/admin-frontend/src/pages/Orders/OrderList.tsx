import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Order, OrderSearchParams, OrderStatus } from '@/types/order';
import { orderService } from '@/services/orders';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchOrders, fetchOrderStats, updateOrderStatus } from '@/store/orderSlice';
import OrderDetail from './OrderDetail';
import OrderForm from './OrderForm';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderList: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | undefined>();

  const dispatch = useAppDispatch();
  const { orders, loading, pagination, searchParams, stats } = useAppSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders({ pagination, searchParams }));
    dispatch(fetchOrderStats());
  }, [dispatch, pagination, searchParams]);

  // 状态标签配置
  const statusConfig = {
    [OrderStatus.PENDING]: { color: 'orange', text: '待确认' },
    [OrderStatus.CONFIRMED]: { color: 'blue', text: '已确认' },
    [OrderStatus.IN_PROGRESS]: { color: 'processing', text: '进行中' },
    [OrderStatus.COMPLETED]: { color: 'green', text: '已完成' },
    [OrderStatus.CANCELLED]: { color: 'red', text: '已取消' },
    [OrderStatus.REFUNDED]: { color: 'purple', text: '已退款' },
  };

  // 表格列定义
  const columns: ColumnsType<Order> = [
    {
      title: '订单信息',
      key: 'orderInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            {record.orderNo}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {new Date(record.createdAt).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '用户信息',
      key: 'userInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.user?.nickname || '未设置'}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.user?.phone}
          </div>
        </div>
      ),
    },
    {
      title: '套餐信息',
      dataIndex: ['package', 'name'],
      width: 180,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            ¥{record.totalAmount.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      title: '预约时间',
      dataIndex: ['timeSlot'],
      width: 150,
      render: (timeSlot) => timeSlot ? (
        <div>
          <div>{timeSlot.date}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {timeSlot.startTime}-{timeSlot.endTime}
          </div>
        </div>
      ) : '-',
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 100,
      render: (status: OrderStatus) => {
        const config = statusConfig[status];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      width: 100,
      render: (status: string) => {
        const paymentConfig = {
          pending: { color: 'orange', text: '待支付' },
          paid: { color: 'green', text: '已支付' },
          failed: { color: 'red', text: '支付失败' },
          refunded: { color: 'purple', text: '已退款' },
        };
        const config = paymentConfig[status as keyof typeof paymentConfig];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Dropdown
            menu={{
              items: getActionMenuItems(record),
            }}
            trigger={['click']}
          >
            <Button type="link" icon={<MoreOutlined />}>
              更多
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 获取操作菜单项
  const getActionMenuItems = (record: Order) => {
    const items = [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => handleEdit(record),
      },
    ];

    if (record.status === OrderStatus.PENDING) {
      items.push({
        key: 'confirm',
        icon: <CheckCircleOutlined />,
        label: '确认订单',
        onClick: () => handleStatusChange(record.id, 'confirm'),
      });
    }

    if (record.status !== OrderStatus.CANCELLED && record.status !== OrderStatus.COMPLETED) {
      items.push({
        key: 'cancel',
        icon: <CloseCircleOutlined />,
        label: '取消订单',
        onClick: () => handleStatusChange(record.id, 'cancel'),
      });
    }

    if (record.status === OrderStatus.CONFIRMED) {
      items.push({
        key: 'complete',
        icon: <PlayCircleOutlined />,
        label: '完成订单',
        onClick: () => handleStatusChange(record.id, 'complete'),
      });
    }

    return items;
  };

  // 搜索处理
  const handleSearch = (_values: OrderSearchParams) => {
    // dispatch(setSearchParams(values));
  };

  // 查看详情
  const handleViewDetail = (order: Order) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  // 编辑订单
  const handleEdit = (order: Order) => {
    setCurrentOrder(order);
    setFormVisible(true);
  };

  // 状态变更
  const handleStatusChange = async (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    try {
      await dispatch(updateOrderStatus({ id, action })).unwrap();
      message.success(`订单${action === 'confirm' ? '确认' : action === 'cancel' ? '取消' : '完成'}成功`);
      dispatch(fetchOrders({ pagination, searchParams }));
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 批量操作
  const handleBatchAction = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的订单');
      return;
    }

    try {
      await orderService.batchOperateOrders(selectedRowKeys, action);
      message.success('批量操作成功');
      setSelectedRowKeys([]);
      dispatch(fetchOrders({ pagination, searchParams }));
    } catch (error) {
      message.error('批量操作失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      await orderService.exportOrders(searchParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总订单数" value={stats?.totalOrders || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理订单" value={stats?.pendingOrders || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成订单" value={stats?.completedOrders || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats?.totalRevenue || 0}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索订单号/手机号"
              onSearch={(value) => handleSearch({ orderNo: value, phone: value })}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="订单状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ status: value })}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="支付状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ paymentStatus: value })}
            >
              <Option value="pending">待支付</Option>
              <Option value="paid">已支付</Option>
              <Option value="failed">支付失败</Option>
              <Option value="refunded">已退款</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={(dates) => {
                handleSearch({
                  startDate: dates?.[0]?.toISOString(),
                  endDate: dates?.[1]?.toISOString(),
                });
              }}
            />
          </Col>
        </Row>

        {/* 操作按钮 */}
        <Row style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setFormVisible(true)}
            >
              新增订单
            </Button>
            <Button
              onClick={() => handleBatchAction('confirm')}
              disabled={selectedRowKeys.length === 0}
            >
              批量确认
            </Button>
            <Button
              onClick={() => handleBatchAction('cancel')}
              disabled={selectedRowKeys.length === 0}
            >
              批量取消
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出数据
            </Button>
          </Space>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
          }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (_page: number, _pageSize?: number) => {
              // dispatch(setPagination({ current: page, pageSize }));
            },
          }}
        />
      </Card>

      {/* 订单详情弹窗 */}
      <OrderDetail
        visible={detailVisible}
        order={currentOrder}
        onClose={() => {
          setDetailVisible(false);
          setCurrentOrder(undefined);
        }}
      />

      {/* 订单表单弹窗 */}
      <OrderForm
        visible={formVisible}
        order={currentOrder}
        onCancel={() => {
          setFormVisible(false);
          setCurrentOrder(undefined);
        }}
        onSubmit={() => {
          setFormVisible(false);
          setCurrentOrder(undefined);
          dispatch(fetchOrders({ pagination, searchParams }));
        }}
      />
    </div>
  );
};

export default OrderList;
