const { ORDER_STATUS_TEXT } = require('../../utils/constants.js');

Component({
  properties: {
    order: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: true
    }
  },

  methods: {
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
      return ['confirmed', 'paid_deposit'].includes(order.status) && 
             order.paymentStatus !== 'paid';
    },

    // 事件处理
    onCardTap() {
      this.triggerEvent('cardTap', { order: this.data.order });
    },

    onCancelOrder() {
      this.triggerEvent('cancelOrder', { order: this.data.order });
    },

    onPayOrder() {
      this.triggerEvent('payOrder', { order: this.data.order });
    },

    onViewDetail() {
      this.triggerEvent('viewDetail', { order: this.data.order });
    }
  }
});
