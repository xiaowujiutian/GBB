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
  Popconfirm,
} from 'antd';
import {
  ExportOutlined,
  SyncOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Payment, PaymentSearchParams, PaymentStatus, PaymentMethod } from '@/types/payment';
import { paymentService } from '@/services/payments';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<PaymentSearchParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [refundVisible, setRefundVisible] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | undefined>();
  const [stats, setStats] = useState({
    totalPayments: 0,
    successPayments: 0,
    totalAmount: 0,
    todayAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getPayments({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
      });
      setPayments(response.data.list);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('加载支付列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await paymentService.getPaymentStats();
      setStats(response.data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 状态配置
  const statusConfig = {
    [PaymentStatus.PENDING]: { color: 'orange', text: '待支付', icon: <ClockCircleOutlined /> },
    [PaymentStatus.PROCESSING]: { color: 'blue', text: '处理中', icon: <SyncOutlined spin /> },
    [PaymentStatus.SUCCESS]: { color: 'green', text: '支付成功', icon: <CheckCircleOutlined /> },
    [PaymentStatus.FAILED]: { color: 'red', text: '支付失败', icon: <CloseCircleOutlined /> },
    [PaymentStatus.CANCELLED]: { color: 'default', text: '已取消', icon: <CloseCircleOutlined /> },
    [PaymentStatus.REFUNDING]: { color: 'orange', text: '退款中', icon: <SyncOutlined spin /> },
    [PaymentStatus.REFUNDED]: { color: 'purple', text: '已退款', icon: <UndoOutlined /> },
  };

  const methodConfig = {
    [PaymentMethod.WECHAT]: { color: 'green', text: '微信支付' },
    [PaymentMethod.ALIPAY]: { color: 'blue', text: '支付宝' },
    [PaymentMethod.CASH]: { color: 'orange', text: '现金支付' },
    [PaymentMethod.BANK_TRANSFER]: { color: 'purple', text: '银行转账' },
  };

  // 表格列定义
  const columns: ColumnsType<Payment> = [
    {
      title: '支付信息',
      key: 'paymentInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            {record.paymentNo}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {new Date(record.createdAt).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '关联订单',
      dataIndex: ['order', 'orderNo'],
      width: 150,
      render: (orderNo, record) => (
        <div>
          <div style={{ fontFamily: 'monospace' }}>{orderNo}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.user?.phone}
          </div>
        </div>
      ),
    },
    {
      title: '金额信息',
      key: 'amount',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#f50' }}>
            ¥{record.amount.toFixed(2)}
          </div>
          {record.refundAmount > 0 && (
            <div style={{ color: '#999', fontSize: '12px' }}>
              已退款: ¥{record.refundAmount.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '支付方式',
      dataIndex: 'method',
      width: 100,
      render: (method: PaymentMethod) => {
        const config = methodConfig[method];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '支付状态',
      dataIndex: 'status',
      width: 120,
      render: (status: PaymentStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config?.color} icon={config?.icon}>
            {config?.text}
          </Tag>
        );
      },
    },
    {
      title: '第三方交易号',
      dataIndex: 'thirdPartyId',
      width: 150,
      render: (id) => id ? (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{id}</span>
      ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === PaymentStatus.PENDING && (
            <Popconfirm
              title="确认支付成功？"
              onConfirm={() => handleConfirmPayment(record.id)}
            >
              <Button type="link">
                确认
              </Button>
            </Popconfirm>
          )}
          {record.status === PaymentStatus.SUCCESS && (
            <Button
              type="link"
              onClick={() => handleRefund(record)}
            >
              退款
            </Button>
          )}
          <Button
            type="link"
            onClick={() => handleSyncStatus(record.id)}
          >
            同步状态
          </Button>
        </Space>
      ),
    },
  ];

  // 搜索处理
  const handleSearch = (values: PaymentSearchParams) => {
    setSearchParams(values);
    setPagination({ ...pagination, current: 1 });
  };

  // 查看详情
  const handleViewDetail = (payment: Payment) => {
    setCurrentPayment(payment);
    // 临时使用 alert 显示详情，后续实现完整的详情弹窗
    alert(`支付详情: ${payment.paymentNo}`);
  };

  // 确认支付
  const handleConfirmPayment = async (id: string) => {
    try {
      await paymentService.confirmPayment(id);
      message.success('支付确认成功');
      fetchPayments();
    } catch (error) {
      message.error('支付确认失败');
    }
  };

  // 退款处理
  const handleRefund = (payment: Payment) => {
    setCurrentPayment(payment);
    setRefundVisible(true);
  };

  // 同步状态
  const handleSyncStatus = async (id: string) => {
    try {
      await paymentService.syncPaymentStatus(id);
      message.success('状态同步成功');
      fetchPayments();
    } catch (error) {
      message.error('状态同步失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      await paymentService.exportPayments(searchParams);
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
            <Statistic
              title="总支付笔数"
              value={stats.totalPayments}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功支付"
              value={stats.successPayments}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总交易额"
              value={stats.totalAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日交易额"
              value={stats.todayAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索支付单号/订单号"
              onSearch={(value) => handleSearch({ paymentNo: value, orderId: value })}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="支付状态"
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
              placeholder="支付方式"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ method: value })}
            >
              {Object.entries(methodConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.text}
                </Option>
              ))}
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
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出数据
            </Button>
            <Button
              onClick={() => window.open('/reconciliation', '_blank')}
            >
              对账管理
            </Button>
          </Space>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={payments}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>

      {/* 退款弹窗 - 临时实现 */}
      {refundVisible && currentPayment && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          zIndex: 1000
        }}>
          <div>退款弹窗将在此处显示</div>
          <div>支付单号: {currentPayment.paymentNo}</div>
          <button onClick={() => setRefundVisible(false)}>关闭</button>
        </div>
      )}
    </div>
  );
};

export default PaymentList;
