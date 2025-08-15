const api = require('../../utils/api.js');
const { ORDER_STATUS_TEXT, PAYMENT_TYPE_TEXT } = require('../../utils/constants.js');

Page({
  data: {
    orderId: '',
    orderInfo: {},
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ orderId: id });
      this.loadOrderDetail(id);
    }
  },

  async loadOrderDetail(orderId) {
    try {
      this.setData({ loading: true });
      const orderInfo = await api.orderAPI.getOrderDetail(orderId);
      
      this.setData({
        orderInfo,
        loading: false
      });
    } catch (error) {
      console.error('加载订单详情失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      });
      this.setData({ loading: false });
    }
  },

  // 工具方法
  getStatusText(status) {
    return ORDER_STATUS_TEXT[status] || status;
  },

  getStatusTagType(status) {
    const typeMap = {
      'pending': 'warning',
      'confirmed': 'primary',
      'paid_deposit': 'primary',
      'paid_full': 'success',
      'in_progress': 'primary',
      'completed': 'success',
      'cancelled': 'default'
    };
    return typeMap[status] || 'default';
  },

  getStepActive(status) {
    const stepMap = {
      'pending': 0,
      'confirmed': 1,
      'paid_deposit': 1,
      'paid_full': 1,
      'in_progress': 2,
      'completed': 3,
      'cancelled': 0
    };
    return stepMap[status] || 0;
  },

  getPaymentTypeText(type) {
    return PAYMENT_TYPE_TEXT[type] || type;
  },

  needPayment(order) {
    return ['confirmed', 'paid_deposit'].includes(order.status) && 
           order.payments?.some(p => p.status !== 'paid');
  },

  // 订单操作
  onCancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.orderAPI.cancelOrder(this.data.orderId);
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });
            this.loadOrderDetail(this.data.orderId);
          } catch (error) {
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  onPayOrder() {
    wx.navigateTo({
      url: `/pages/payment/index?orderId=${this.data.orderId}`
    });
  },

  onRateService() {
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    });
  }
});
