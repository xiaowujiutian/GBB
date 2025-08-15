import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Image,
  Rate,
} from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Package, PackageSearchParams } from '@/types/package';
import { Status } from '@/types/common';
import PackageDetail from './PackageDetail';
import PackageForm from './PackageForm';
const { Search } = Input;
const { Option } = Select;

const PackageList: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<PackageSearchParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Package | undefined>();
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    popularPackages: 0,
    avgPrice: 0,
  });

  // 模拟数据加载
  useEffect(() => {
    fetchPackages();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const fetchPackages = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const mockData: Package[] = [
        {
          id: '1',
          name: '经典写真套餐',
          description: '包含化妆、拍摄、精修照片',
          price: 888,
          originalPrice: 1288,
          duration: 120,
          services: ['专业化妆', '服装搭配', '拍摄服务', '后期精修'],
          images: ['/api/placeholder/400/300'],
          status: Status.ACTIVE,
          isPopular: true,
          orderCount: 156,
          rating: 4.8,
          tags: ['热销', '经典'],
          category: '个人写真',
          maxBookings: 5,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
        // 可以添加更多模拟数据
      ];
      
      setPackages(mockData);
      setPagination({ ...pagination, total: mockData.length });
      setStats({
        totalPackages: mockData.length,
        activePackages: mockData.filter(p => p.status === Status.ACTIVE).length,
        popularPackages: mockData.filter(p => p.isPopular).length,
        avgPrice: mockData.reduce((sum, p) => sum + p.price, 0) / mockData.length,
      });
      setLoading(false);
    }, 1000);
  };

  // 表格列定义
  const columns: ColumnsType<Package> = [
    {
      title: '套餐信息',
      key: 'packageInfo',
      width: 300,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Image
            width={80}
            height={60}
            src={record.images[0]}
            style={{ borderRadius: 4, marginRight: 12 }}
            fallback="/api/placeholder/80/60"
          />
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {record.name}
              {record.isPopular && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  <StarOutlined /> 热门
                </Tag>
              )}
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
              {record.description}
            </div>
            <div>
              <Rate disabled value={record.rating} />
              <span style={{ marginLeft: 8, color: '#666', fontSize: '12px' }}>
                {record.rating}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
    },
    {
      title: '价格',
      key: 'price',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ color: '#f50', fontWeight: 'bold', fontSize: '16px' }}>
            ¥{record.price}
          </div>
          {record.originalPrice && record.originalPrice > record.price && (
            <div style={{ color: '#999', textDecoration: 'line-through', fontSize: '12px' }}>
              ¥{record.originalPrice}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '服务时长',
      dataIndex: 'duration',
      width: 100,
      render: (duration: number) => `${duration}分钟`,
    },
    {
      title: '预订次数',
      dataIndex: 'orderCount',
      width: 100,
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: Status) => (
        <Tag color={status === Status.ACTIVE ? 'green' : 'red'}>
          {status === Status.ACTIVE ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 搜索处理
  const handleSearch = (values: PackageSearchParams) => {
    setSearchParams(values);
    setPagination({ ...pagination, current: 1 });
  };

  // 查看详情
  const handleViewDetail = (pkg: Package) => {
    setCurrentPackage(pkg);
    setDetailVisible(true);
  };

  // 编辑套餐
  const handleEdit = (pkg: Package) => {
    setCurrentPackage(pkg);
    setFormVisible(true);
  };

  // 删除套餐
  const handleDelete = (_id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个套餐吗？此操作不可恢复。',
      onOk: async () => {
        try {
          message.success('删除成功');
          fetchPackages();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总套餐数"
              value={stats.totalPackages}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已上架"
              value={stats.activePackages}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="热门套餐"
              value={stats.popularPackages}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均价格"
              value={stats.avgPrice}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索套餐名称"
              onSearch={(value) => handleSearch({ name: value })}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="套餐状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ status: value })}
            >
              <Option value={Status.ACTIVE}>已上架</Option>
              <Option value={Status.INACTIVE}>已下架</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="套餐分类"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ category: value })}
            >
              <Option value="个人写真">个人写真</Option>
              <Option value="情侣写真">情侣写真</Option>
              <Option value="亲子写真">亲子写真</Option>
              <Option value="商务形象">商务形象</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="是否热门"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ isPopular: value })}
            >
              <Option value={true}>热门套餐</Option>
              <Option value={false}>普通套餐</Option>
            </Select>
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
              新增套餐
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={() => message.info('导出功能开发中')}
            >
              导出数据
            </Button>
          </Space>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={packages}
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

      {/* 套餐详情弹窗 */}
      <PackageDetail
        visible={detailVisible}
        package={currentPackage}
        onClose={() => {
          setDetailVisible(false);
          setCurrentPackage(undefined);
        }}
      />

      {/* 套餐表单弹窗 */}
      <PackageForm
        visible={formVisible}
        package={currentPackage}
        onCancel={() => {
          setFormVisible(false);
          setCurrentPackage(undefined);
        }}
        onSubmit={() => {
          setFormVisible(false);
          setCurrentPackage(undefined);
          fetchPackages();
        }}
      />
    </div>
  );
};

export default PackageList;     
