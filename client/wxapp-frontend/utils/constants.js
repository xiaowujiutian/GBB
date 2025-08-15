// API 配置
export const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com/api',
  TIMEOUT: 10000,
  VERSION: 'v1'
};

// 订单状态
export const ORDER_STATUS = {
  PENDING: 'pending',           // 待确认
  CONFIRMED: 'confirmed',       // 已确认
  PAID_DEPOSIT: 'paid_deposit', // 已付定金
  PAID_FULL: 'paid_full',       // 已付全款
  IN_PROGRESS: 'in_progress',   // 进行中
  COMPLETED: 'completed',       // 已完成
  CANCELLED: 'cancelled'        // 已取消
};

export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: '待确认',
  [ORDER_STATUS.CONFIRMED]: '已确认',
  [ORDER_STATUS.PAID_DEPOSIT]: '已付定金',
  [ORDER_STATUS.PAID_FULL]: '已付全款',
  [ORDER_STATUS.IN_PROGRESS]: '进行中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消'
};

// 服务类型
export const SERVICE_TYPES = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  VIP: 'vip'
};

export const SERVICE_TYPE_TEXT = {
  [SERVICE_TYPES.BASIC]: '基础服务',
  [SERVICE_TYPES.PREMIUM]: '高级服务',
  [SERVICE_TYPES.VIP]: 'VIP服务'
};

// 支付方式
export const PAYMENT_METHODS = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay',
  BALANCE: 'balance'
};

// 支付类型
export const PAYMENT_TYPE = {
  DEPOSIT: 'deposit',   // 定金
  FULL: 'full',        // 全款
  BALANCE: 'balance'   // 尾款
};

export const PAYMENT_TYPE_TEXT = {
  [PAYMENT_TYPE.DEPOSIT]: '定金',
  [PAYMENT_TYPE.FULL]: '全款',
  [PAYMENT_TYPE.BALANCE]: '尾款'
};

// 支付状态
export const PAYMENT_STATUS = {
  PENDING: 'pending',     // 待支付
  PAID: 'paid',          // 已支付
  FAILED: 'failed',      // 支付失败
  REFUNDED: 'refunded'   // 已退款
};

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SEARCH_HISTORY: 'searchHistory'
};

// 默认配置
export const DEFAULT_CONFIG = {
  PAGE_SIZE: 10,
  LOCATION_TIMEOUT: 5000,
  DEBOUNCE_DELAY: 300
};

// 业务配置
export const BUSINESS_CONFIG = {
  PAGE_SIZE: 10,
  MAX_SEARCH_HISTORY: 10,
  PAYMENT_TIMEOUT: 30 * 60 * 1000, // 30分钟
  BOOKING_ADVANCE_DAYS: 30 // 最多提前30天预约
};
