import React, { useState, useEffect } from "react";
import { Drawer, Descriptions, Tag, Timeline, Card, Space, Button } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Order, OrderStatus, OrderTimeline } from "@/types/order";

interface OrderDetailProps {
  visible: boolean;
  order?: Order;
  onClose: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  visible,
  order,
  onClose,
}) => {
  const [timeline, setTimeline] = useState<OrderTimeline[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && order) {
      fetchTimeline();
    }
  }, [visible, order]);

  const fetchTimeline = async () => {
    if (!order) return;

    try {
      setLoading(true);
      // 临时注释掉不存在的方法，等待后续实现
      // const response = await orderService.getOrderTimeline(order.id);
      // setTimeline(response.data.data);
      console.log("获取订单时间线:", order.id);
      setTimeline([]);
    } catch (error) {
      console.error("获取订单时间线失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const statusConfig = {
    [OrderStatus.PENDING]: {
      color: "orange",
      text: "待确认",
      icon: <ClockCircleOutlined />,
    },
    [OrderStatus.CONFIRMED]: {
      color: "blue",
      text: "已确认",
      icon: <CheckCircleOutlined />,
    },
    [OrderStatus.IN_PROGRESS]: {
      color: "processing",
      text: "进行中",
      icon: <ClockCircleOutlined />,
    },
    [OrderStatus.COMPLETED]: {
      color: "green",
      text: "已完成",
      icon: <CheckCircleOutlined />,
    },
    [OrderStatus.CANCELLED]: {
      color: "red",
      text: "已取消",
      icon: <CloseCircleOutlined />,
    },
    [OrderStatus.REFUNDED]: {
      color: "purple",
      text: "已退款",
      icon: <CloseCircleOutlined />,
    },
  };

  return (
    <Drawer
      title="订单详情"
      placement="right"
      size="large"
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button type="primary">编辑</Button>
          <Button>打印</Button>
        </Space>
      }
    >
      <Card title="订单信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="订单号" span={2}>
            <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
              {order.orderNo}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag
              color={statusConfig[order.status]?.color}
              icon={statusConfig[order.status]?.icon}
            >
              {statusConfig[order.status]?.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="支付状态">
            <Tag color="orange">待支付</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="订单金额">
            <span
              style={{ fontSize: "16px", fontWeight: "bold", color: "#f50" }}
            >
              ¥{order.totalAmount.toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="已支付金额">
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>¥0.00</span>
          </Descriptions.Item>
          <Descriptions.Item label="支付方式">-</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(order.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {order.notes || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="用户信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="用户昵称">
            <Space>
              <UserOutlined />
              {order.user?.nickname || "未设置"}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="手机号">
            <Space>
              <PhoneOutlined />
              {order.user?.phone}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="微信号">-</Descriptions.Item>
          <Descriptions.Item label="VIP等级">普通用户</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="套餐信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="套餐名称">
            {order.package?.name}
          </Descriptions.Item>
          <Descriptions.Item label="套餐价格">
            ¥{order.package?.price.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="服务时长">-</Descriptions.Item>
          <Descriptions.Item label="服务内容" span={2}>
            -
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="预约信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="预约日期">
            <Space>
              <CalendarOutlined />
              {order.timeSlot ? "请联系管理员获取详情" : "-"}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="预约时间">
            {order.timeSlot ? "请联系管理员获取详情" : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="订单流程" loading={loading}>
        <Timeline>
          <Timeline.Item color="blue">
            订单创建
            <div style={{ fontSize: "12px", color: "#666" }}>
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </Timeline.Item>

          {timeline.map((item: OrderTimeline, index: number) => (
            <Timeline.Item
              key={index}
              color={index === timeline.length - 1 ? "green" : "blue"}
            >
              {item.description}
              <div style={{ fontSize: "12px", color: "#666" }}>
                {item.operator} · {new Date(item.timestamp).toLocaleString()}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </Drawer>
  );
};

export default OrderDetail;
