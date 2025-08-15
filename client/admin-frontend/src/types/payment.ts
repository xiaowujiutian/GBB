import { BaseEntity } from './common';
import { Order } from './order';
import { User } from './user';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

export interface Payment extends BaseEntity {
  paymentNo: string;
  orderId: string;
  order?: Order;
  userId: string;
  user?: User;
  amount: number;
  actualAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  thirdPartyId?: string;
  thirdPartyData?: any;
  refundAmount: number;
  refundReason?: string;
  notes?: string;
  processedAt?: string;
  refundedAt?: string;
  platformFee: number;
  netAmount: number;
}

export interface PaymentSearchParams {
  paymentNo?: string;
  orderId?: string;
  phone?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentStats {
  totalPayments: number;
  successPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalAmount: number;
  totalRefund: number;
  todayAmount: number;
  conversionRate: number;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  notes?: string;
}
