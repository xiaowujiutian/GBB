// 用户中心页面：展示和编辑个人信息，查看历史订单
Page({
  data: {
    userInfo: null,
    orders: [],
    loading: true,
    editing: false,
    editData: {}
  },
  onLoad() {
    this.loadUserInfo();
    this.loadUserOrders();
  },
  onShow() {
    this.loadUserInfo();
  },
  loadUserInfo() {
    const app = getApp();
    this.setData({
      userInfo: app.globalData.userInfo,
      editData: { ...app.globalData.userInfo }
    });
  },
  loadUserOrders() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) return;
    wx.request({
      url: `https://api.example.com/orders/user/${userInfo.id}`,
      method: 'GET',
      success: res => {
        this.setData({ orders: res.data.data || [], loading: false });
      },
      fail: () => {
        wx.showToast({ title: '订单加载失败', icon: 'error' });
        this.setData({ loading: false });
      }
    });
  },
  onEditTap() {
    this.setData({ editing: true, editData: { ...this.data.userInfo } });
  },
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ editData: { ...this.data.editData, [field]: e.detail.value } });
  },
  submitEdit() {
    const { editData, userInfo } = this.data;
    wx.request({
      url: `https://api.example.com/users/${userInfo.id}`,
      method: 'PATCH',
      data: {
        nickname: editData.nickname,
        phone: editData.phone
      },
      success: res => {
        wx.showToast({ title: '保存成功', icon: 'success' });
        wx.setStorageSync('userInfo', res.data);
        this.setData({ userInfo: res.data, editing: false });
      },
      fail: () => {
        wx.showToast({ title: '保存失败', icon: 'error' });
      }
    });
  },
  cancelEdit() {
    this.setData({ editing: false });
  },
  onOrderTap(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${orderId}`
    });
  },
  // 登录
  async onLogin() {
    try {
      wx.showLoading({ title: '登录中...' });
      
      const app = getApp();
      await app.login();
      
      this.loadUserInfo();
      wx.hideLoading();
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
    } catch (error) {
      wx.hideLoading();
      console.error('登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'error'
      });
    }
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.logout();
        }
      }
    });
  },

  // 页面跳转方法
  goToOrders() {
    wx.switchTab({
      url: '/pages/order-list/index'
    });
  },

  goToBookingHistory() {
    wx.navigateTo({
      url: '/pages/order-list/index?activeTab=completed'
    });
  },

  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-xxx-xxxx\n工作时间：9:00-18:00',
      showCancel: false
    });
  },

  feedback() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '这是一个专业的服务预约平台，致力于为用户提供优质的服务体验。',
      showCancel: false
    });
  },

  privacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护，详细政策请查看我们的隐私声明。',
      showCancel: false
    });
  },

  serviceTerms() {
    wx.showModal({
      title: '服务条款',
      content: '使用本服务即表示您同意我们的服务条款和使用规则。',
      showCancel: false
    });
  }
});
