import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  DatePicker,
  Switch,
  Tag,
  Modal,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Calendar,
  Badge,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { TimeSlot, TimeSlotSearchParams } from '@/types/timeSlot';
import { Status } from '@/types/common';
import { timeSlotService } from '@/services/timeSlots';
import TimeSlotForm from './TimeSlotForm';
import BatchCreateModal from './BatchCreateModal';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const TimeSlotList: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<TimeSlotSearchParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [formVisible, setFormVisible] = useState(false);
  const [batchVisible, setBatchVisible] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarData, setCalendarData] = useState<Record<string, TimeSlot[]>>({});
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    utilizationRate: 0,
    avgBookingRate: 0,
  });

  useEffect(() => {
    if (viewMode === 'list') {
      fetchTimeSlots();
    } else {
      fetchCalendarData();
    }
    fetchStats();
  }, [viewMode, pagination.current, pagination.pageSize, searchParams]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await timeSlotService.getTimeSlots({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
      });
      setTimeSlots(response.data.list);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('加载时间槽列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const now = dayjs();
      const response = await timeSlotService.getCalendarData({
        year: now.year(),
        month: now.month() + 1,
      });
      setCalendarData(response.data);
    } catch (error) {
      message.error('加载日历数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await timeSlotService.getTimeSlotStats();
      setStats(response.data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 表格列定义
  const columns: ColumnsType<TimeSlot> = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 120,
      render: (date: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{date}</div>
          {record.isHoliday && (
            <Tag color="orange">节假日</Tag>
          )}
        </div>
      ),
    },
    {
      title: '时间段',
      key: 'timeRange',
      width: 150,
      render: (_, record) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {record.startTime} - {record.endTime}
        </div>
      ),
    },
    {
      title: '容量信息',
      key: 'capacity',
      width: 150,
      render: (_, record) => (
        <div>
          <div>
            <TeamOutlined style={{ marginRight: 4 }} />
            已预订: {record.bookedCount}/{record.capacity}
          </div>
          <Progress
            percent={(record.bookedCount / record.capacity) * 100}
            size="small"
            status={record.bookedCount >= record.capacity ? 'success' : 'active'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: Status) => (
        <Tag color={status === Status.ACTIVE ? 'green' : 'red'}>
          {status === Status.ACTIVE ? '可用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '价格倍数',
      dataIndex: 'priceMultiplier',
      width: 100,
      render: (multiplier: number) => (
        <Tag color={multiplier > 1 ? 'red' : 'default'}>
          {multiplier}x
        </Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => handleCopy(record)}
          >
            复制
          </Button>
          <Button
            type="link"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === Status.ACTIVE ? '禁用' : '启用'}
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 日历单元格渲染
  const dateCellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const slots = calendarData[dateStr] || [];
    
    if (slots.length === 0) return null;

    const availableSlots = slots.filter(slot => 
      slot.status === Status.ACTIVE && slot.availableCount > 0
    ).length;
    
    const totalSlots = slots.length;
    const bookedSlots = totalSlots - availableSlots;

    return (
      <div style={{ fontSize: '12px' }}>
        <div style={{ color: '#52c41a' }}>
          <Badge status="success" />
          可用: {availableSlots}
        </div>
        <div style={{ color: '#faad14' }}>
          <Badge status="warning" />
          已订: {bookedSlots}
        </div>
      </div>
    );
  };

  // 编辑时间槽
  const handleEdit = (slot: TimeSlot) => {
    setCurrentSlot(slot);
    setFormVisible(true);
  };

  // 复制时间槽
  const handleCopy = (_slot: TimeSlot) => {
    Modal.confirm({
      title: '复制时间槽',
      content: '选择要复制到的日期',
      // 这里可以添加日期选择组件
      onOk: async () => {
        try {
          // await timeSlotService.copyTimeSlots({
          //   sourceDate: slot.date,
          //   targetDates: selectedDates,
          // });
          message.success('复制成功');
          fetchTimeSlots();
        } catch (error) {
          message.error('复制失败');
        }
      },
    });
  };

  // 切换状态
  const handleToggleStatus = async (slot: TimeSlot) => {
    try {
      const newStatus = slot.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;
      await timeSlotService.updateTimeSlot(slot.id, { status: newStatus });
      message.success('状态更新成功');
      if (viewMode === 'list') {
        fetchTimeSlots();
      } else {
        fetchCalendarData();
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 删除时间槽
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个时间槽吗？',
      onOk: async () => {
        try {
          await timeSlotService.deleteTimeSlot(id);
          message.success('删除成功');
          if (viewMode === 'list') {
            fetchTimeSlots();
          } else {
            fetchCalendarData();
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 搜索处理
  const handleSearch = (values: TimeSlotSearchParams) => {
    setSearchParams(values);
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总时间槽"
              value={stats.totalSlots}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="可用时间槽"
              value={stats.availableSlots}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="利用率"
              value={stats.utilizationRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均预订率"
              value={stats.avgBookingRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={viewMode}
          onChange={(key) => setViewMode(key as 'list' | 'calendar')}
          tabBarExtraContent={
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setFormVisible(true)}
              >
                新增时间槽
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setBatchVisible(true)}
              >
                批量创建
              </Button>
            </Space>
          }
        >
          <TabPane tab="列表视图" key="list">
            {/* 搜索表单 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: '100%' }}
                  onChange={(dates) => {
                    handleSearch({
                      startDate: dates?.[0]?.format('YYYY-MM-DD'),
                      endDate: dates?.[1]?.format('YYYY-MM-DD'),
                    });
                  }}
                />
              </Col>
              <Col span={4}>
                <Switch
                  checkedChildren="仅显示有余量"
                  unCheckedChildren="显示全部"
                  onChange={(checked) => handleSearch({ hasCapacity: checked })}
                />
              </Col>
            </Row>

            {/* 数据表格 */}
            <Table
              columns={columns}
              dataSource={timeSlots}
              loading={loading}
              rowKey="id"
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
          </TabPane>

          <TabPane tab="日历视图" key="calendar">
            <Calendar
              dateCellRender={dateCellRender}
              onPanelChange={(_date) => {
                // 切换月份时重新加载数据
                fetchCalendarData();
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 时间槽表单弹窗 */}
      <TimeSlotForm
        visible={formVisible}
        timeSlot={currentSlot}
        onCancel={() => {
          setFormVisible(false);
          setCurrentSlot(undefined);
        }}
        onSubmit={() => {
          setFormVisible(false);
          setCurrentSlot(undefined);
          if (viewMode === 'list') {
            fetchTimeSlots();
          } else {
            fetchCalendarData();
          }
        }}
      />

      {/* 批量创建弹窗 */}
      <BatchCreateModal
        visible={batchVisible}
        onCancel={() => setBatchVisible(false)}
        onSubmit={() => {
          setBatchVisible(false);
          if (viewMode === 'list') {
            fetchTimeSlots();
          } else {
            fetchCalendarData();
          }
        }}
      />
    </div>
  );
};

export default TimeSlotList;
