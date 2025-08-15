import { BaseEntity } from './common';
import { User } from './user';
import { Package } from './package';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface Order extends BaseEntity {
  orderNo: string;
  userId: string;
  user?: User;
  packageId: string;
  package?: Package;
  timeSlotId: string;
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'wechat' | 'alipay' | 'cash';
  notes?: string;
  cancelReason?: string;
  refundReason?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface OrderSearchParams {
  orderNo?: string;
  phone?: string;
  status?: OrderStatus;
  paymentStatus?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderFormData {
  userId: string;
  packageId: string;
  timeSlotId: string;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayOrders: number;
  conversionRate: number;
}

export interface OrderTimeline {
  timestamp: string;
  action: string;
  operator: string;
  description: string;
}
