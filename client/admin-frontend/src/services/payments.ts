import { request } from './api';
import { Payment, PaymentSearchParams, RefundRequest } from '@/types/payment';
import { PaginationParams } from '@/types/common';

export const paymentService = {
  // 获取支付列表
  getPayments: async (params: PaginationParams & PaymentSearchParams) => {
    // Mock data for development
    return {
      data: {
        list: [] as Payment[],
        pagination: {
          current: params.page,
          pageSize: params.pageSize,
          total: 0,
        },
      },
    };
  },

  // 获取支付详情
  getPaymentById: (id: string) =>
    request.get<Payment>(`/payments/${id}`),

  // 处理退款
  processRefund: async (refundRequest: RefundRequest) => {
    return request.post('/payments/refund', refundRequest);
  },

  // 同步第三方支付状态
  syncPaymentStatus: async (id: string) => {
    return request.patch(`/payments/${id}/sync`);
  },

  // 确认支付
  confirmPayment: async (id: string) => {
    return request.patch(`/payments/${id}/confirm`);
  },

  // 取消支付
  cancelPayment: (id: string, reason: string) =>
    request.patch(`/payments/${id}/cancel`, { reason }),

  // 获取支付统计
  getPaymentStats: async () => {
    // Mock data for development
    return {
      data: {
        totalPayments: 1580,
        successPayments: 1420,
        totalAmount: 128500.00,
        todayAmount: 12800.00,
      },
    };
  },

  // 获取对账数据
  getReconciliation: (params: { date: string; platform?: string }) =>
    request.get('/payments/reconciliation', { params }),

  // 导出支付数据
  exportPayments: async (params: PaymentSearchParams) => {
    try {
      const response = await request.get('/payments/export', { 
        params, 
        responseType: 'blob' as any 
      });
      
      // 创建下载链接
      const blob = new Blob([response.data.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  // 获取支付趋势
  getPaymentTrends: (period: string) =>
    request.get('/payments/trends', { params: { period } }),
};
