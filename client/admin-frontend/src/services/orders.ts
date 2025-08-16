import axios from 'axios';
import { PaginatedResponse } from '@/types/common';
import { Order, OrderStats } from '@/types/order';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface OrderSearchParams {
  status?: string;
  userId?: string;
  packageId?: string;
  dateRange?: [string, string];
  keyword?: string;
}

export interface GetOrdersParams extends OrderSearchParams {
  page?: number;
  pageSize?: number;
}

export const orderService = {
  // 获取订单列表
  async getOrders(params: GetOrdersParams): Promise<{ data: PaginatedResponse<Order> }> {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // 获取订单统计
  async getOrderStats(): Promise<{ data: OrderStats }> {
    const response = await api.get('/orders/stats');
    return response.data;
  },

  // 确认订单
  async confirmOrder(id: string): Promise<void> {
    await api.post(`/orders/${id}/confirm`);
  },

  // 取消订单
  async cancelOrder(id: string, reason: string): Promise<void> {
    await api.post(`/orders/${id}/cancel`, { reason });
  },

  // 完成订单
  async completeOrder(id: string): Promise<void> {
    await api.post(`/orders/${id}/complete`);
  },

  // 获取单个订单详情
  async getOrder(id: string): Promise<{ data: Order }> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // 获取订单趋势数据
  async getOrderTrends(_period: string): Promise<{ data: Array<{ date: string; orders: number; revenue: number }> }> {
    // Mock data for development - 后续连接后端API时替换
    return Promise.resolve({
      data: [] as Array<{ date: string; orders: number; revenue: number }>,
    });
  },

  // 导出订单数据
  async exportOrders(params: OrderSearchParams): Promise<Blob> {
    const response = await api.get('/orders/export', { 
      params, 
      responseType: 'blob'
    });
    return response.data;
  },

  // 批量操作订单
  async batchOperateOrders(orderIds: string[], action: string): Promise<void> {
    await api.post('/orders/batch', { orderIds, action });
  },
};

export default orderService;
