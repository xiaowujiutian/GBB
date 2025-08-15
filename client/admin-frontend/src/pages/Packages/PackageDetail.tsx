import React from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  Card,
  Space,
  Button,
  Image,
  Rate,
  List,
} from "antd";
import {
  StarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Package } from "@/types/package";
import { Status } from "@/types/common";

interface PackageDetailProps {
  visible: boolean;
  package?: Package;
  onClose: () => void;
}

const PackageDetail: React.FC<PackageDetailProps> = ({
  visible,
  package: pkg,
  onClose,
}) => {
  if (!pkg) return null;

  return (
    <Drawer
      title="套餐详情"
      placement="right"
      size="large"
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button type="primary">编辑</Button>
          <Button>复制</Button>
        </Space>
      }
    >
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="套餐名称" span={2}>
            <Space>
              {pkg.name}
              {pkg.isPopular && (
                <Tag color="red" icon={<StarOutlined />}>
                  热门
                </Tag>
              )}
              <Tag color={pkg.status === Status.ACTIVE ? "green" : "red"}>
                {pkg.status === Status.ACTIVE ? "上架" : "下架"}
              </Tag>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="套餐价格">
            <Space>
              <span
                style={{ fontSize: "18px", color: "#f50", fontWeight: "bold" }}
              >
                ¥{pkg.price.toFixed(2)}
              </span>
              {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                <span style={{ textDecoration: "line-through", color: "#999" }}>
                  ¥{pkg.originalPrice.toFixed(2)}
                </span>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="服务时长">
            <Space>
              <ClockCircleOutlined />
              {pkg.duration} 分钟
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="套餐分类">{pkg.category}</Descriptions.Item>
          <Descriptions.Item label="最大预订数">
            {pkg.maxBookings}
          </Descriptions.Item>
          <Descriptions.Item label="订单数量">
            <Space>
              <ShoppingCartOutlined />
              {pkg.orderCount} 次
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="套餐评分">
            <Space>
              <Rate disabled value={pkg.rating} />
              <span>{pkg.rating.toFixed(1)}</span>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="套餐描述" span={2}>
            {pkg.description || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="服务内容" style={{ marginBottom: 16 }}>
        <List
          dataSource={pkg.services}
          renderItem={(service) => (
            <List.Item>
              <List.Item.Meta title={service} />
            </List.Item>
          )}
        />
      </Card>

      <Card title="套餐标签" style={{ marginBottom: 16 }}>
        <Space wrap>
          {pkg.tags.map((tag, index) => (
            <Tag key={index} color="blue">
              {tag}
            </Tag>
          ))}
        </Space>
      </Card>

      {pkg.images && pkg.images.length > 0 && (
        <Card title="套餐图片">
          <Image.PreviewGroup>
            <Space wrap>
              {pkg.images.map((image, index) => (
                <Image
                  key={index}
                  width={120}
                  height={120}
                  src={image}
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}
    </Drawer>
  );
};

export default PackageDetail;
