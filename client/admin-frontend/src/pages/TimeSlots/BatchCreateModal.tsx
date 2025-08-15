import React, { useState } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Button,
  Space,
  List,
  message,
  Card,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { BatchCreateParams } from '@/types/timeSlot';
import { timeSlotService } from '@/services/timeSlots';

const { RangePicker } = DatePicker;

interface TimeSlotTemplate {
  startTime: string;
  endTime: string;
  capacity: number;
}

interface BatchCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const BatchCreateModal: React.FC<BatchCreateModalProps> = ({
  visible,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlotTemplate[]>([
    { startTime: '09:00', endTime: '10:00', capacity: 1 },
  ]);

  const handleAddTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { startTime: '10:00', endTime: '11:00', capacity: 1 },
    ]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const handleTimeSlotChange = (index: number, field: keyof TimeSlotTemplate, value: any) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
    setTimeSlots(newTimeSlots);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData: BatchCreateParams = {
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        timeSlots,
        excludeWeekends: values.excludeWeekends || false,
        excludeHolidays: values.excludeHolidays || false,
        priceMultiplier: values.priceMultiplier || 1,
      };

      await timeSlotService.batchCreateTimeSlots(formData);
      message.success('批量创建时间槽成功');
      onSubmit();
    } catch (error) {
      message.error('批量创建时间槽失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="批量创建时间槽"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          excludeWeekends: false,
          excludeHolidays: false,
          priceMultiplier: 1,
        }}
      >
        <Form.Item
          name="dateRange"
          label="日期范围"
          rules={[{ required: true, message: '请选择日期范围' }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="excludeWeekends" label="排除周末" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="excludeHolidays" label="排除节假日" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="priceMultiplier" label="价格倍数">
          <InputNumber min={0.1} max={10} step={0.1} style={{ width: '100%' }} />
        </Form.Item>

        <Card title="时间段设置" size="small">
          <List
            dataSource={timeSlots}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveTimeSlot(index)}
                    disabled={timeSlots.length === 1}
                  />,
                ]}
              >
                <Space>
                  <TimePicker
                    value={dayjs(item.startTime, 'HH:mm')}
                    format="HH:mm"
                    onChange={(time) =>
                      handleTimeSlotChange(index, 'startTime', time?.format('HH:mm'))
                    }
                  />
                  <span>至</span>
                  <TimePicker
                    value={dayjs(item.endTime, 'HH:mm')}
                    format="HH:mm"
                    onChange={(time) =>
                      handleTimeSlotChange(index, 'endTime', time?.format('HH:mm'))
                    }
                  />
                  <span>容量:</span>
                  <InputNumber
                    value={item.capacity}
                    min={1}
                    max={100}
                    onChange={(value) =>
                      handleTimeSlotChange(index, 'capacity', value || 1)
                    }
                  />
                </Space>
              </List.Item>
            )}
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddTimeSlot}
            block
            style={{ marginTop: 16 }}
          >
            添加时间段
          </Button>
        </Card>
      </Form>
    </Modal>
  );
};

export default BatchCreateModal;
