import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Modal,
  message,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { User, UserSearchParams } from '@/types/user';
import { userService } from '@/services/users';

import { Status } from '@/types/common';
import UserForm from './UserForm';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<UserSearchParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    vipUsers: 0,
  });

  // 加载用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
      });
      setUsers(response.data.list);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const fetchStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchParams]);

  useEffect(() => {
    fetchStats();
  }, []);

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <Space>
          <img
            src={record.avatar || '/default-avatar.png'}
            alt="头像"
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <div>
            <div>{record.nickname || '未设置'}</div>
            <div style={{ color: '#999', fontSize: '12px' }}>{record.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '微信号',
      dataIndex: 'wechatId',
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: Status) => (
        <Tag color={status === Status.ACTIVE ? 'green' : 'red'}>
          {status === Status.ACTIVE ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: 'VIP',
      dataIndex: 'isVip',
      render: (isVip: boolean, record) => (
        <Tag color={isVip ? 'gold' : 'default'}>
          {isVip ? `VIP${record.vipLevel || 1}` : '普通'}
        </Tag>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
    },
    {
      title: '消费金额',
      dataIndex: 'totalAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      render: (time) => time ? new Date(time).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
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
  const handleSearch = (values: UserSearchParams) => {
    setSearchParams(values);
    setPagination({ ...pagination, current: 1 });
  };

  // 编辑用户
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormVisible(true);
  };

  // 删除用户
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await userService.deleteUser(id);
          message.success('删除成功');
          fetchUsers();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }

    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个用户吗？`,
      onOk: async () => {
        try {
          await userService.batchDeleteUsers(selectedRowKeys);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchUsers();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 导出数据
  const handleExport = async () => {
    try {
      setLoading(true);
      await userService.exportUsers(searchParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 表单提交
  const handleFormSubmit = () => {
    setFormVisible(false);
    setEditingUser(undefined);
    fetchUsers();
    fetchStats();
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总用户数" value={stats.totalUsers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活跃用户" value={stats.activeUsers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日新增" value={stats.newUsersToday} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="VIP用户" value={stats.vipUsers} />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索手机号/昵称/微信号"
              onSearch={(value) => handleSearch({ ...searchParams, phone: value })}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="用户状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ ...searchParams, status: value })}
            >
              <Option value={Status.ACTIVE}>正常</Option>
              <Option value={Status.INACTIVE}>禁用</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="VIP类型"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch({ ...searchParams, isVip: value })}
            >
              <Option value={true}>VIP用户</Option>
              <Option value={false}>普通用户</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={(dates) => {
                handleSearch({
                  ...searchParams,
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
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setFormVisible(true)}
            >
              新增用户
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出数据
            </Button>
          </Space>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
          }}
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

      {/* 用户表单弹窗 */}
      <UserForm
        visible={formVisible}
        user={editingUser}
        onCancel={() => {
          setFormVisible(false);
          setEditingUser(undefined);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default UserList;
