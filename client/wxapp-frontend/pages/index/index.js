const api = require('../../utils/api.js');

Page({
  data: {
    packages: [],
    searchKeyword: '',
    priceSort: '', // 'asc' | 'desc' | ''
    loading: false,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadPackages();
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.packages.length > 0) {
      this.refreshPackages();
    }
  },

  onPullDownRefresh() {
    this.onRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  // 加载套餐列表
  async loadPackages(isRefresh = false) {
    try {
      if (isRefresh) {
        this.setData({ refreshing: true, page: 1 });
      } else if (this.data.page === 1) {
        this.setData({ loading: true });
      } else {
        this.setData({ loadingMore: true });
      }

      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.searchKeyword,
        sortBy: this.data.priceSort ? 'price' : 'createdAt',
        sortOrder: this.data.priceSort || 'desc',
        isActive: true // 只显示激活的套餐
      };

      const result = await api.packageAPI.getPackages(params);
      
      const newPackages = this.data.page === 1 ? result.data : [...this.data.packages, ...result.data];
      
      this.setData({
        packages: newPackages,
        hasMore: result.data.length === this.data.pageSize,
        loading: false,
        refreshing: false,
        loadingMore: false
      });

      if (isRefresh) {
        wx.stopPullDownRefresh();
      }

    } catch (error) {
      console.error('加载套餐失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      });
      
      this.setData({
        loading: false,
        refreshing: false,
        loadingMore: false
      });
    }
  },

  // 刷新数据
  onRefresh() {
    this.setData({ page: 1 });
    this.loadPackages(true);
  },

  // 刷新套餐数据（用于页面显示时）
  refreshPackages() {
    this.setData({ page: 1 });
    this.loadPackages(true);
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      page: this.data.page + 1
    });
    this.loadPackages();
  },

  // 搜索相关方法
  onSearchChange(event) {
    this.setData({
      searchKeyword: event.detail
    });
  },

  onSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ page: 1 });
    this.loadPackages();
  },

  // 排序方法
  sortByPrice(event) {
    const sort = event.currentTarget.dataset.sort;
    this.setData({
      priceSort: sort,
      page: 1
    });
    this.loadPackages();
  },

  clearSort() {
    this.setData({
      priceSort: '',
      page: 1
    });
    this.loadPackages();
  },

  // 套餐相关方法
  onPackageTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/package-detail/index?id=${id}`
    });
  },

  onBookNow(event) {
    const { id } = event.currentTarget.dataset;
    
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

    wx.navigateTo({
      url: `/pages/booking/index?packageId=${id}`
    });
  }
});


