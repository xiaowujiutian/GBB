const BASE_URL = 'https://your-api-domain.com/api';

// 通用请求方法
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const app = getApp();
    
    wx.request({
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，跳转登录
          app.logout();
          reject(new Error('未授权'));
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '网络错误',
          icon: 'error'
        });
        reject(error);
      }
    });
  });
};

// 用户相关API
const userAPI = {
  // 登录
  login: (data) => request('/auth/login', { method: 'POST', data }),
  
  // 获取用户信息
  getUserInfo: (userId) => request(`/users/${userId}`),
  
  // 更新用户信息
  updateUserInfo: (userId, data) => request(`/users/${userId}`, { method: 'PUT', data })
};

// 套餐相关API
const packageAPI = {
  // 获取所有激活套餐
  getPackages: (params = {}) => request('/packages', { data: params }),
  
  // 获取套餐详情
  getPackageDetail: (packageId) => request(`/packages/${packageId}`),
  
  // 获取套餐价格
  getPackagePrice: (packageId) => request(`/packages/${packageId}/price`)
};

// 时间槽相关API
const timeSlotAPI = {
  // 获取可用时间槽
  getAvailableSlots: (date, packageId) => request(`/time-slots/available?date=${date}&packageId=${packageId}`),
  
  // 预约时间槽
  bookTimeSlot: (data) => request('/time-slots/book', { method: 'POST', data })
};

// 订单相关API
const orderAPI = {
  // 创建订单
  createOrder: (data) => request('/orders', { method: 'POST', data }),
  
  // 获取用户订单列表
  getUserOrders: (userId, params = {}) => request(`/orders/user/${userId}`, { data: params }),
  
  // 获取订单详情
  getOrderDetail: (orderId) => request(`/orders/${orderId}`),
  
  // 取消订单
  cancelOrder: (orderId) => request(`/orders/${orderId}/cancel`, { method: 'PUT' }),
  
  // 更新订单状态
  updateOrderStatus: (orderId, status) => request(`/orders/${orderId}/status`, { 
    method: 'PUT', 
    data: { status } 
  })
};

// 支付相关API
const paymentAPI = {
  // 创建支付订单
  createPayment: (data) => request('/payments', { method: 'POST', data }),
  
  // 获取支付结果
  getPaymentResult: (paymentId) => request(`/payments/${paymentId}/result`),
  
  // 退款
  refund: (paymentId, data) => request(`/payments/${paymentId}/refund`, { method: 'POST', data })
};

// 搜索相关API
const searchAPI = {
  // 搜索用户
  searchUsers: (keyword, params = {}) => request('/search/users', { 
    data: { keyword, ...params } 
  }),
  
  // 搜索订单
  searchOrders: (keyword, params = {}) => request('/search/orders', { 
    data: { keyword, ...params } 
  })
};

module.exports = {
  request,
  userAPI,
  packageAPI,
  timeSlotAPI,
  orderAPI,
  paymentAPI,
  searchAPI,
  // 便捷方法
  login: userAPI.login,
  getPackages: packageAPI.getPackages,
  createOrder: orderAPI.createOrder
};
