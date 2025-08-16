import { BaseEntity } from "./common";

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export interface Order extends BaseEntity {
  id: string;
  orderNo: string;
  user: {
    id: string;
    nickname: string;
    phone: string;
  };
  package: {
    id: string;
    name: string;
    price: number;
  };
  timeSlot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSearchParams {
  orderNo?: string;
  phone?: string;
  status?: OrderStatus;
  paymentStatus?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  dateRange?: [string, string];
  keyword?: string;
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
  confirmedOrders: number;
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
