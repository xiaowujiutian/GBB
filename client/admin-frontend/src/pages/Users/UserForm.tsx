import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  message,
} from 'antd';
import { User, UserFormData } from '@/types/user';
import { userService } from '@/services/users';
import { Status } from '@/types/common';

const { Option } = Select;

interface UserFormProps {
  visible: boolean;
  user?: User;
  onCancel: () => void;
  onSubmit: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  user,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (user) {
        form.setFieldsValue({
          phone: user.phone,
          nickname: user.nickname,
          wechatId: user.wechatId,
          status: user.status,
          isVip: user.isVip,
          vipLevel: user.vipLevel,
          tags: user.tags,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData: UserFormData = {
        phone: values.phone,
        nickname: values.nickname,
        wechatId: values.wechatId,
        status: values.status,
        isVip: values.isVip,
        vipLevel: values.vipLevel,
        tags: values.tags || [],
      };

      if (user) {
        await userService.updateUser(user.id, formData);
        message.success('更新用户成功');
      } else {
        await userService.createUser(formData);
        message.success('创建用户成功');
      }

      onSubmit();
    } catch (error) {
      message.error(user ? '更新用户失败' : '创建用户失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={user ? '编辑用户' : '新增用户'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: Status.ACTIVE,
          isVip: false,
          vipLevel: 1,
        }}
      >
        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>

        <Form.Item name="nickname" label="昵称">
          <Input placeholder="请输入昵称" />
        </Form.Item>

        <Form.Item name="wechatId" label="微信号">
          <Input placeholder="请输入微信号" />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Select>
            <Option value={Status.ACTIVE}>正常</Option>
            <Option value={Status.INACTIVE}>禁用</Option>
          </Select>
        </Form.Item>

        <Form.Item name="isVip" label="VIP用户" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="vipLevel"
          label="VIP等级"
          dependencies={['isVip']}
          style={{
            display: Form.useWatch('isVip', form) ? 'block' : 'none',
          }}
        >
          <InputNumber min={1} max={10} />
        </Form.Item>

        <Form.Item name="tags" label="用户标签">
          <Select
            mode="tags"
            placeholder="请输入或选择标签"
            style={{ width: '100%' }}
          >
            <Option value="新用户">新用户</Option>
            <Option value="活跃用户">活跃用户</Option>
            <Option value="高价值">高价值</Option>
            <Option value="流失风险">流失风险</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;