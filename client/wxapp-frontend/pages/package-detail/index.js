const api = require('../../utils/api.js');

// 套餐详情页面：展示套餐详细信息，跳转预约
Page({
  data: {
    packageId: '',
    packageInfo: {},
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ packageId: id });
      this.loadPackageDetail(id);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  async loadPackageDetail(packageId) {
    try {
      this.setData({ loading: true });
      const packageInfo = await api.packageAPI.getPackageDetail(packageId);
      
      this.setData({
        packageInfo,
        loading: false
      });
    } catch (error) {
      console.error('加载套餐详情失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      });
      this.setData({ loading: false });
    }
  },

  onBookPackage() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再进行预约',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/index'
            });
          }
        }
      });
      return;
    }

    // 跳转到预约页面
    wx.navigateTo({
      url: `/pages/booking/index?packageId=${this.data.packageId}`
    });
  }
});
