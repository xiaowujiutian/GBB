const api = require('../../utils/api.js');
const { ORDER_STATUS_TEXT, STORAGE_KEYS } = require('../../utils/constants.js');

Page({
  data: {
    searchKeyword: '',
    activeTab: 'users',
    searchResults: [],
    searchHistory: [],
    hasSearched: false,
    searching: false
  },

  onLoad() {
    this.loadSearchHistory();
  },

  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync(STORAGE_KEYS.SEARCH_HISTORY) || [];
    this.setData({ searchHistory: history });
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    let history = this.data.searchHistory;
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到开头
    history.unshift(keyword);
    
    // 限制历史记录数量
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    this.setData({ searchHistory: history });
    wx.setStorageSync(STORAGE_KEYS.SEARCH_HISTORY, history);
  },

  // 搜索相关方法
  onSearchChange(event) {
    this.setData({
      searchKeyword: event.detail
    });
  },

  async onSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ searching: true });
      
      let results = [];
      if (this.data.activeTab === 'users') {
        results = await api.searchAPI.searchUsers(keyword);
      } else {
        results = await api.searchAPI.searchOrders(keyword);
      }

      this.setData({
        searchResults: results.data || [],
        hasSearched: true,
        searching: false
      });

      // 保存搜索历史
      this.saveSearchHistory(keyword);

    } catch (error) {
      console.error('搜索失败:', error);
      wx.showToast({
        title: error.message || '搜索失败',
        icon: 'error'
      });
      this.setData({ searching: false });
    }
  },

  // 标签切换
  onTabChange(event) {
    this.setData({
      activeTab: event.detail.name,
      searchResults: [],
      hasSearched: false
    });
  },

  // 搜索历史操作
  onHistoryTap(event) {
    const keyword = event.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.onSearch();
  },

  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] });
          wx.removeStorageSync(STORAGE_KEYS.SEARCH_HISTORY);
        }
      }
    });
  },

  // 结果点击事件
  onUserTap(event) {
    const user = event.currentTarget.dataset.user;
    // 可以跳转到用户详情或显示更多操作
    wx.showModal({
      title: '用户信息',
      content: `姓名: ${user.nickName || user.name}\n手机: ${user.phone}`,
      showCancel: false
    });
  },

  onOrderTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${id}`
    });
  },

  // 工具方法
  getStatusText(status) {
    return ORDER_STATUS_TEXT[status] || status;
  },

  getStatusTagType(status) {
    const typeMap = {
      'pending': 'warning',
      'confirmed': 'primary',
      'completed': 'success',
      'cancelled': 'default'
    };
    return typeMap[status] || 'default';
  }
});
