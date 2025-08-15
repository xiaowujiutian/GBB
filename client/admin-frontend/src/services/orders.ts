import { request } from './api';
import { Order, OrderStats, OrderSearchParams, OrderFormData, OrderTimeline } from '@/types/order';
import { PaginationParams } from '@/types/common';

export const orderService = {
  // 获取订单列表
  getOrders: (params: PaginationParams & OrderSearchParams) => {
    // Mock data for development
    return Promise.resolve({
      data: {
        list: [] as Order[],
        pagination: {
          current: params.page,
          pageSize: params.pageSize,
          total: 0,
        },
      },
    });
  },

  // 获取订单详情
  getOrderById: (id: string) =>
    request.get<Order>(`/orders/${id}`),

  // 创建订单
  createOrder: (data: OrderFormData) =>
    request.post<Order>('/orders', data),

  // 更新订单
  updateOrder: (id: string, data: Partial<OrderFormData>) =>
    request.put<Order>(`/orders/${id}`, data),

  // 确认订单
  confirmOrder: (id: string) =>
    request.patch(`/orders/${id}/confirm`),

  // 取消订单
  cancelOrder: (id: string, reason: string) =>
    request.patch(`/orders/${id}/cancel`, { reason }),

  // 完成订单
  completeOrder: (id: string) =>
    request.patch(`/orders/${id}/complete`),

  // 批量操作订单
  batchOperateOrders: (ids: string[], operation: string, data?: any) =>
    request.post('/orders/batch-operate', { ids, operation, data }),

  // 获取订单统计
  getOrderStats: (): Promise<{ data: OrderStats }> => {
    // Mock data for development
    return Promise.resolve({
      data: {
        totalOrders: 1580,
        pendingOrders: 25,
        completedOrders: 1420,
        cancelledOrders: 135,
        totalRevenue: 128500.00,
        todayOrders: 12,
        conversionRate: 89.5,
      },
    });
  },

  // 获取订单时间线
  getOrderTimeline: (id: string) =>
    request.get<OrderTimeline[]>(`/orders/${id}/timeline`),

  // 获取订单趋势数据
  getOrderTrends: (_period: string) => {
    // Mock data for development
    return Promise.resolve({
      data: [] as Array<{ date: string; orders: number; revenue: number }>,
    });
  },

  // 导出订单数据
  exportOrders: (params: OrderSearchParams) =>
    request.get('/orders/export', { 
      params, 
      responseType: 'blob' as any 
    }),
};
