const api = require('../../utils/api.js');
const { ORDER_STATUS, ORDER_STATUS_TEXT } = require('../../utils/constants.js');

Page({
  data: {
    orders: [],
    activeTab: 'all',
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshOrders();
  },

  onPullDownRefresh() {
    this.onRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  // 标签切换
  onTabChange(event) {
    const activeTab = event.detail.name;
    this.setData({
      activeTab,
      page: 1
    });
    this.loadOrders();
  },

  // 加载订单列表
  async loadOrders(isRefresh = false) {
    try {
      if (isRefresh) {
        this.setData({ refreshing: true, page: 1 });
      } else if (this.data.page > 1) {
        this.setData({ loadingMore: true });
      }

      const app = getApp();
      if (!app.globalData.userInfo?.id) {
        wx.showToast({
          title: '请先登录',
          icon: 'error'
        });
        return;
      }

      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: this.data.activeTab === 'all' ? undefined : this.data.activeTab
      };

      const result = await api.orderAPI.getUserOrders(app.globalData.userInfo.id, params);
      
      const newOrders = this.data.page === 1 ? result.data : [...this.data.orders, ...result.data];
      
      this.setData({
        orders: newOrders,
        hasMore: result.data.length === this.data.pageSize,
        refreshing: false,
        loadingMore: false
      });

      if (isRefresh) {
        wx.stopPullDownRefresh();
      }

    } catch (error) {
      console.error('加载订单失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      });
      
      this.setData({
        refreshing: false,
        loadingMore: false
      });
    }
  },

  // 刷新订单
  onRefresh() {
    this.setData({ page: 1 });
    this.loadOrders(true);
  },

  refreshOrders() {
    this.setData({ page: 1 });
    this.loadOrders(true);
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      page: this.data.page + 1
    });
    this.loadOrders();
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

  needPayment(order) {
    return ['confirmed', 'paid_deposit'].includes(order.status) && order.paymentStatus !== 'paid';
  },

  // 订单操作
  onOrderTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${id}`
    });
  },

  async onCancelOrder(event) {
    const { id } = event.currentTarget.dataset;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.orderAPI.cancelOrder(id);
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });
            this.refreshOrders();
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

  onPayOrder(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/payment/index?orderId=${id}`
    });
  }
});
