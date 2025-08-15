import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { Package, PackageFormData } from '@/types/package';
import { Status } from '@/types/common';

const { TextArea } = Input;
const { Option } = Select;

interface PackageFormProps {
  visible: boolean;
  package?: Package;
  onCancel: () => void;
  onSubmit: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({
  visible,
  package: pkg,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (visible) {
      if (pkg) {
        form.setFieldsValue({
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          originalPrice: pkg.originalPrice,
          duration: pkg.duration,
          services: pkg.services,
          status: pkg.status,
          isPopular: pkg.isPopular,
          tags: pkg.tags,
          category: pkg.category,
          maxBookings: pkg.maxBookings,
        });
        // 设置图片列表
        if (pkg.images) {
          setFileList(
            pkg.images.map((url, index) => ({
              uid: `-${index}`,
              name: `image-${index}`,
              status: 'done',
              url,
            }))
          );
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [visible, pkg, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData: PackageFormData = {
        ...values,
        images: fileList.map(file => file.url || file.response?.url).filter(Boolean),
      };

      // 这里应该调用 API 服务
      console.log('Package form data:', formData);
      message.success(pkg ? '更新套餐成功' : '创建套餐成功');
      onSubmit();
    } catch (error) {
      message.error(pkg ? '更新套餐失败' : '创建套餐失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <Modal
      title={pkg ? '编辑套餐' : '新增套餐'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: Status.ACTIVE,
          isPopular: false,
          duration: 60,
          maxBookings: 1,
          services: [],
          tags: [],
        }}
      >
        <Form.Item
          name="name"
          label="套餐名称"
          rules={[{ required: true, message: '请输入套餐名称' }]}
        >
          <Input placeholder="请输入套餐名称" />
        </Form.Item>

        <Form.Item name="description" label="套餐描述">
          <TextArea rows={3} placeholder="请输入套餐描述" />
        </Form.Item>

        <Form.Item
          name="price"
          label="套餐价格"
          rules={[{ required: true, message: '请输入套餐价格' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={2}
            addonBefore="¥"
          />
        </Form.Item>

        <Form.Item name="originalPrice" label="原价">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={2}
            addonBefore="¥"
          />
        </Form.Item>

        <Form.Item
          name="duration"
          label="服务时长(分钟)"
          rules={[{ required: true, message: '请输入服务时长' }]}
        >
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>

        <Form.Item name="category" label="套餐分类">
          <Select placeholder="请选择套餐分类">
            <Option value="个人写真">个人写真</Option>
            <Option value="情侣写真">情侣写真</Option>
            <Option value="亲子写真">亲子写真</Option>
            <Option value="商务形象">商务形象</Option>
          </Select>
        </Form.Item>

        <Form.Item name="services" label="服务内容">
          <Select
            mode="tags"
            placeholder="请输入或选择服务内容"
            style={{ width: '100%' }}
          >
            <Option value="化妆">化妆</Option>
            <Option value="拍摄">拍摄</Option>
            <Option value="修图">修图</Option>
            <Option value="选片">选片</Option>
          </Select>
        </Form.Item>

        <Form.Item name="maxBookings" label="最大预订数">
          <InputNumber style={{ width: '100%' }} min={1} max={100} />
        </Form.Item>

        <Form.Item name="status" label="套餐状态">
          <Select>
            <Option value={Status.ACTIVE}>上架</Option>
            <Option value={Status.INACTIVE}>下架</Option>
          </Select>
        </Form.Item>

        <Form.Item name="isPopular" label="热门套餐" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="tags" label="套餐标签">
          <Select
            mode="tags"
            placeholder="请输入或选择标签"
            style={{ width: '100%' }}
          >
            <Option value="热门">热门</Option>
            <Option value="新品">新品</Option>
            <Option value="特价">特价</Option>
          </Select>
        </Form.Item>

        <Form.Item name="images" label="套餐图片">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            beforeUpload={() => false} // 阻止自动上传
          >
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PackageForm;
