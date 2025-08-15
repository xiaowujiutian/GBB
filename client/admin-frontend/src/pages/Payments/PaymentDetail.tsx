import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Timeline,
  Card,
  Space,
  Button,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UndoOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Payment, PaymentStatus, PaymentMethod } from '@/types/payment';

interface PaymentDetailProps {
  visible: boolean;
  payment?: Payment;
  onClose: () => void;
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({
  visible,
  payment,
  onClose,
}) => {
  if (!payment) return null;

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
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.ALIPAY]: '支付宝',
    [PaymentMethod.CASH]: '现金支付',
    [PaymentMethod.BANK_TRANSFER]: '银行转账',
  };

  return (
    <Drawer
      title="支付详情"
      placement="right"
      size="large"
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button type="primary">打印</Button>
        </Space>
      }
    >
      <Card title="支付信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="支付单号" span={2}>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {payment.paymentNo}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="支付状态">
            <Tag 
              color={statusConfig[payment.status]?.color} 
              icon={statusConfig[payment.status]?.icon}
            >
              {statusConfig[payment.status]?.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="支付方式">
            {methodConfig[payment.method]}
          </Descriptions.Item>
          <Descriptions.Item label="支付金额">
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f50' }}>
              ¥{payment.amount.toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="实付金额">
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              ¥{payment.actualAmount.toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="第三方交易号">
            {payment.thirdPartyId || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="支付时间">
            {payment.processedAt ? new Date(payment.processedAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="退款金额">
            ¥{payment.refundAmount.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="退款原因">
            {payment.refundReason || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {payment.notes || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="关联订单信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="订单号">
            {payment.order?.orderNo || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="用户手机号">
            {payment.user?.phone || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="操作记录">
        <Timeline>
          <Timeline.Item color="blue">
            支付单创建
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(payment.createdAt).toLocaleString()}
            </div>
          </Timeline.Item>
          {payment.processedAt && (
            <Timeline.Item color="green">
              支付完成
              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date(payment.processedAt).toLocaleString()}
              </div>
            </Timeline.Item>
          )}
          {payment.refundedAt && (
            <Timeline.Item color="red">
              退款完成
              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date(payment.refundedAt).toLocaleString()}
              </div>
            </Timeline.Item>
          )}
        </Timeline>
      </Card>
    </Drawer>
  );
};

export default PaymentDetail;
