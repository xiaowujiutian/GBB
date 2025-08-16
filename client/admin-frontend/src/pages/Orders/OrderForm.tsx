import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  message,
  Row,
  Col,
} from "antd";
import { Order, OrderFormData } from "@/types/order";
import { User } from "@/types/user";
import { Package } from "@/types/package";
import { TimeSlot } from "@/types/timeSlot";
import { userService } from "@/services/users";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

interface OrderFormProps {
  visible: boolean;
  order?: Order;
  onCancel: () => void;
  onSubmit: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  visible,
  order,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [packages] = useState<Package[]>([]);
  const [timeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (visible) {
      loadInitialData();
      if (order) {
        form.setFieldsValue({
          userId: order.user?.id,
          packageId: order.package?.id,
          timeSlotId: order.timeSlot?.id,
          notes: order.notes,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, order, form]);

  const loadInitialData = async () => {
    try {
      // 只加载用户列表
      const usersRes = await userService.getUsers({ page: 1, pageSize: 100 });
      setUsers(usersRes.data.list);

      // 套餐数据暂时为空，等待后续实现
      // const packagesRes = await packageService.getPackages({ page: 1, pageSize: 100 });
      // setPackages(packagesRes.data.list);
    } catch (error) {
      message.error("加载数据失败");
    }
  };

  const loadTimeSlots = async (_date: string) => {
    try {
      // 时间槽加载功能暂时为空，等待后续实现
      // const response = await timeSlotService.getAvailableSlots({ date });
      // setTimeSlots(response.data);
    } catch (error) {
      message.error("加载时间槽失败");
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const dateStr = date.format("YYYY-MM-DD");
      loadTimeSlots(dateStr);
      form.setFieldValue("timeSlotId", undefined);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData: OrderFormData = {
        userId: values.userId,
        packageId: values.packageId,
        timeSlotId: values.timeSlotId,
        notes: values.notes,
      };

      if (order) {
        // 临时使用通用的更新方法，等待后续实现具体的 updateOrder 方法
        // await orderService.updateOrder(order.id, formData);
        console.log("更新订单:", order.id, formData);
        message.success("更新订单功能开发中");
      } else {
        // 临时使用通用的创建方法，等待后续实现具体的 createOrder 方法
        // await orderService.createOrder(formData);
        console.log("创建订单:", formData);
        message.success("创建订单功能开发中");
      }

      onSubmit();
    } catch (error) {
      message.error(order ? "更新订单失败" : "创建订单失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={order ? "编辑订单" : "新增订单"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="userId"
              label="选择用户"
              rules={[{ required: true, message: "请选择用户" }]}
            >
              <Select
                placeholder="请选择用户"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {users.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.nickname || user.phone} ({user.phone})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="packageId"
              label="选择套餐"
              rules={[{ required: true, message: "请选择套餐" }]}
            >
              <Select placeholder="请选择套餐">
                {packages.map((pkg) => (
                  <Option key={pkg.id} value={pkg.id}>
                    {pkg.name} (¥{pkg.price})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="预约日期"
              rules={[{ required: true, message: "请选择预约日期" }]}
            >
              <DatePicker
                placeholder="请选择预约日期"
                style={{ width: "100%" }}
                onChange={handleDateChange}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timeSlotId"
              label="预约时间"
              rules={[{ required: true, message: "请选择预约时间" }]}
            >
              <Select placeholder="请先选择日期">
                {timeSlots.map((slot) => (
                  <Option key={slot.id} value={slot.id}>
                    {slot.startTime} - {slot.endTime}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="备注">
          <TextArea rows={4} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderForm;
