import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const api = require('../../utils/api.js');
const { BUSINESS_CONFIG } = require('../../utils/constants.js');

// 预约页面：选择日期、时间槽，填写信息，提交订单
Page({
  data: {
    // 服务相关
    selectedService: {
      id: '',
      name: '请选择服务',
      price: '0.00',
      desc: '',
      image: ''
    },
    serviceTypes: [
      { id: 1, value: 'basic', label: '基础服务', desc: '包含基本功能' },
      { id: 2, value: 'premium', label: '高级服务', desc: '包含高级功能' },
      { id: 3, value: 'vip', label: 'VIP服务', desc: '全功能定制服务' }
    ],
    selectedServiceType: 'basic',
    
    // 时间相关
    selectedDate: '请选择日期',
    selectedTime: '请选择时间',
    timeSlots: [],
    showCalendarPopup: false,
    showTimePickerPopup: false,
    minDate: Date.now(),
    maxDate: Date.now() + BUSINESS_CONFIG.BOOKING_ADVANCE_DAYS * 24 * 60 * 60 * 1000, // 30天后
    currentTime: '09:00',
    
    // 数量和价格
    quantity: 1,
    totalPrice: '0.00',
    
    // 用户信息
    customerInfo: {
      name: '',
      phone: '',
      remark: ''
    },
    
    // 状态
    loading: false,
    submitting: false
  },

  onLoad(options) {
    const { packageId } = options;
    if (packageId) {
      this.setData({ packageId });
      this.loadPackageInfo(packageId);
      this.loadUserInfo();
    }
  },

  // 加载服务信息
  async loadPackageInfo(packageId) {
    try {
      const packageInfo = await api.packageAPI.getPackageDetail(packageId);
      this.setData({ packageInfo });
    } catch (error) {
      console.error('加载套餐信息失败:', error);
    }
  },

  loadUserInfo() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        'customerInfo.name': app.globalData.userInfo.nickName || '',
        'customerInfo.phone': app.globalData.userInfo.phone || ''
      });
    }
  },

  // 日期选择相关方法
  showCalendar() {
    this.setData({ showCalendarPopup: true });
  },

  hideCalendar() {
    this.setData({ showCalendarPopup: false });
  },

  async onDateSelect(event) {
    const date = new Date(event.detail);
    const selectedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    this.setData({
      selectedDate,
      selectedTime: '', // 重置时间选择
      showCalendarPopup: false
    });

    // 加载该日期的可用时间槽
    this.loadAvailableTimeSlots(selectedDate);
  },

  // 时间选择相关方法
  async loadAvailableTimeSlots(date) {
    try {
      this.setData({ loading: true });
      const slots = await api.timeSlotAPI.getAvailableSlots(date, this.data.packageId);
      
      const timeSlots = slots.map(slot => ({
        text: `${slot.startTime} - ${slot.endTime}`,
        value: slot.id
      }));

      this.setData({
        timeSlots,
        loading: false
      });
    } catch (error) {
      console.error('加载时间槽失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载时间失败',
        icon: 'error'
      });
    }
  },

  showTimePicker() {
    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请先选择日期',
        icon: 'none'
      });
      return;
    }
    this.setData({ showTimePickerPopup: true });
  },

  hideTimePicker() {
    this.setData({ showTimePickerPopup: false });
  },

  onTimeSelect(event) {
    const { value } = event.detail;
    const selectedSlot = this.data.timeSlots.find(slot => slot.value === value);
    
    this.setData({
      selectedTime: selectedSlot?.text || '',
      selectedTimeSlotId: value,
      showTimePickerPopup: false
    });
  },

  // 客户信息输入方法
  onNameChange(event) {
    this.setData({
      'customerInfo.name': event.detail
    });
  },

  onPhoneChange(event) {
    this.setData({
      'customerInfo.phone': event.detail
    });
  },

  onRemarkChange(event) {
    this.setData({
      'customerInfo.remark': event.detail
    });
  },

  // 表单验证
  validateForm() {
    const { selectedDate, selectedTime, customerInfo } = this.data;
    
    if (!selectedDate) {
      wx.showToast({ title: '请选择预约日期', icon: 'none' });
      return false;
    }
    
    if (!selectedTime) {
      wx.showToast({ title: '请选择预约时间', icon: 'none' });
      return false;
    }
    
    if (!customerInfo.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return false;
    }
    
    if (!customerInfo.phone.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }
    
    if (!/^1[3-9]\d{9}$/.test(customerInfo.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    
    return true;
  },

  // 提交预约
  async onSubmitBooking() {
    if (!this.validateForm()) {
      return;
    }

    try {
      this.setData({ submitting: true });

      const orderData = {
        packageId: this.data.packageId,
        timeSlotId: this.data.selectedTimeSlotId,
        customerInfo: this.data.customerInfo,
        bookingDate: this.data.selectedDate,
        bookingTime: this.data.selectedTime
      };

      const order = await api.orderAPI.createOrder(orderData);
      
      wx.showToast({
        title: '预约成功',
        icon: 'success'
      });

      // 跳转到订单详情或支付页面
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order-detail/index?id=${order.id}`
        });
      }, 1500);

    } catch (error) {
      console.error('提交预约失败:', error);
      wx.showToast({
        title: error.message || '预约失败',
        icon: 'error'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});