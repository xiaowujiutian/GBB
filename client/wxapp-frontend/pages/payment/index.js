const api = require('../../utils/api.js');
const { PAYMENT_TYPE, PAYMENT_TYPE_TEXT } = require('../../utils/constants.js');

Page({
  data: {
    orderId: '',
    orderInfo: {},
    paymentType: '',
    paymentOptions: [],
    loading: true,
    paying: false
  },

  onLoad(options) {
    const { orderId } = options;
    if (orderId) {
      this.setData({ orderId });
      this.loadOrderInfo(orderId);
    }
  },

  async loadOrderInfo(orderId) {
    try {
      this.setData({ loading: true });
      const orderInfo = await api.orderAPI.getOrderDetail(orderId);
      
      // 生成支付选项
      const paymentOptions = this.generatePaymentOptions(orderInfo);
      
      this.setData({
        orderInfo,
        paymentOptions,
        loading: false
      });
    } catch (error) {
      console.error('加载订单信息失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      });
      this.setData({ loading: false });
    }
  },

  generatePaymentOptions(orderInfo) {
    const options = [];
    const totalAmount = parseFloat(orderInfo.totalAmount);
    const paidAmount = this.calculatePaidAmount(orderInfo.payments || []);
    const remainingAmount = totalAmount - paidAmount;

    // 如果还没有任何支付记录
    if (paidAmount === 0) {
      // 定金支付选项
      const depositAmount = Math.min(totalAmount * 0.3, totalAmount); // 30%定金
      options.push({
        value: PAYMENT_TYPE.DEPOSIT,
        title: '支付定金',
        desc: `支付${(depositAmount/totalAmount*100).toFixed(0)}%定金，余款服务完成后支付`,
        amount: depositAmount.toFixed(2)
      });

      // 全款支付选项
      options.push({
        value: PAYMENT_TYPE.FULL,
        title: '支付全款',
        desc: '一次性支付全部费用',
        amount: totalAmount.toFixed(2)
      });
    } else if (remainingAmount > 0) {
      // 尾款支付
      options.push({
        value: PAYMENT_TYPE.BALANCE,
        title: '支付尾款',
        desc: '支付剩余费用',
        amount: remainingAmount.toFixed(2)
      });
    }

    return options;
  },

  calculatePaidAmount(payments) {
    return payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  },

  // 支付类型选择
  onPaymentTypeChange(event) {
    this.setData({
      paymentType: event.detail
    });
  },

  selectPaymentType(event) {
    const { value } = event.currentTarget.dataset;
    this.setData({
      paymentType: value
    });
  },

  // 获取当前支付金额
  getCurrentPaymentAmount() {
    const selectedOption = this.data.paymentOptions.find(
      option => option.value === this.data.paymentType
    );
    return selectedOption ? selectedOption.amount : '0.00';
  },

  getPaymentTypeTitle() {
    const selectedOption = this.data.paymentOptions.find(
      option => option.value === this.data.paymentType
    );
    return selectedOption ? selectedOption.title : '选择支付方式';
  },

  // 确认支付
  async onConfirmPayment() {
    if (!this.data.paymentType) {
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ paying: true });

      // 创建支付订单
      const paymentData = {
        orderId: this.data.orderId,
        type: this.data.paymentType,
        amount: this.getCurrentPaymentAmount()
      };

      const paymentOrder = await api.paymentAPI.createPayment(paymentData);

      // 调用微信支付
      const paymentResult = await this.requestWeChatPayment(paymentOrder);

      // 支付成功
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order-detail/index?id=${this.data.orderId}`
        });
      }, 1500);

    } catch (error) {
      console.error('支付失败:', error);
      wx.showToast({
        title: error.message || '支付失败',
        icon: 'error'
      });
    } finally {
      this.setData({ paying: false });
    }
  },

  // 微信支付
  requestWeChatPayment(paymentOrder) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        timeStamp: paymentOrder.timeStamp,
        nonceStr: paymentOrder.nonceStr,
        package: paymentOrder.package,
        signType: paymentOrder.signType,
        paySign: paymentOrder.paySign,
        success: resolve,
        fail: reject
      });
    });
  }
});
