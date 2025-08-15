App({
  globalData: {
    userInfo: null,
    token: null,
    systemInfo: null
  },

  onLaunch() {
    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
      }
    });

    // 检查登录状态
    this.checkLogin();
    
    // 检查更新
    this.checkForUpdates();
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
  },

  // 检查小程序更新
  checkForUpdates() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
        }
      });
    }
  },

  // 用户登录
  async login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (loginRes) => {
          try {
            // 获取用户信息
            const userProfile = await this.getUserProfile();
            
            // 调用后端登录接口
            const api = require('./utils/api.js');
            const loginResult = await api.login({
              code: loginRes.code,
              userInfo: userProfile
            });

            // 保存登录信息
            this.globalData.token = loginResult.token;
            this.globalData.userInfo = loginResult.userInfo;
            
            wx.setStorageSync('token', loginResult.token);
            wx.setStorageSync('userInfo', loginResult.userInfo);
            
            resolve(loginResult);
          } catch (error) {
            reject(error);
          }
        },
        fail: reject
      });
    });
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: reject
      });
    });
  },

  // 退出登录
  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    wx.clearStorageSync();
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});
