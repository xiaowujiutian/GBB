import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Input,
  message,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { TimeSlot, TimeSlotFormData } from '@/types/timeSlot';
import { Status } from '@/types/common';
import { timeSlotService } from '@/services/timeSlots';

const { TextArea } = Input;
const { Option } = Select;

interface TimeSlotFormProps {
  visible: boolean;
  timeSlot?: TimeSlot;
  onCancel: () => void;
  onSubmit: () => void;
}

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({
  visible,
  timeSlot,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (timeSlot) {
        form.setFieldsValue({
          date: dayjs(timeSlot.date),
          startTime: dayjs(timeSlot.startTime, 'HH:mm'),
          endTime: dayjs(timeSlot.endTime, 'HH:mm'),
          capacity: timeSlot.capacity,
          status: timeSlot.status,
          isHoliday: timeSlot.isHoliday,
          priceMultiplier: timeSlot.priceMultiplier,
          notes: timeSlot.notes,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, timeSlot, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData: TimeSlotFormData = {
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        capacity: values.capacity,
        status: values.status,
        isHoliday: values.isHoliday,
        priceMultiplier: values.priceMultiplier,
        notes: values.notes,
      };

      if (timeSlot) {
        await timeSlotService.updateTimeSlot(timeSlot.id, formData);
        message.success('更新时间槽成功');
      } else {
        await timeSlotService.createTimeSlot(formData);
        message.success('创建时间槽成功');
      }

      onSubmit();
    } catch (error) {
      message.error(timeSlot ? '更新时间槽失败' : '创建时间槽失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={timeSlot ? '编辑时间槽' : '新增时间槽'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: Status.ACTIVE,
          isHoliday: false,
          priceMultiplier: 1,
          capacity: 1,
        }}
      >
        <Form.Item
          name="date"
          label="日期"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="startTime"
          label="开始时间"
          rules={[{ required: true, message: '请选择开始时间' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="结束时间"
          rules={[{ required: true, message: '请选择结束时间' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="容量"
          rules={[{ required: true, message: '请输入容量' }]}
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Select>
            <Option value={Status.ACTIVE}>可用</Option>
            <Option value={Status.INACTIVE}>禁用</Option>
          </Select>
        </Form.Item>

        <Form.Item name="priceMultiplier" label="价格倍数">
          <InputNumber min={0.1} max={10} step={0.1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="isHoliday" label="节假日" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="notes" label="备注">
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TimeSlotForm;
