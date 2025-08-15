import { BaseEntity, Status } from './common';

export interface TimeSlot extends BaseEntity {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCount: number;
  status: Status;
  isHoliday: boolean;
  priceMultiplier: number;
  notes?: string;
  bookings?: TimeSlotBooking[];
}

export interface TimeSlotBooking {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userPhone: string;
  packageName: string;
  status: string;
  bookedAt: string;
}

export interface TimeSlotSearchParams {
  startDate?: string;
  endDate?: string;
  status?: Status;
  isHoliday?: boolean;
  hasCapacity?: boolean;
}

export interface TimeSlotFormData {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: Status;
  isHoliday: boolean;
  priceMultiplier: number;
  notes?: string;
}

export interface BatchCreateParams {
  startDate: string;
  endDate: string;
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    capacity: number;
  }>;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  priceMultiplier: number;
}

export interface TimeSlotStats {
  totalSlots: number;
  availableSlots: number;
  fullyBookedSlots: number;
  utilizationRate: number;
  avgBookingRate: number;
  peakHours: Array<{ time: string; rate: number }>;
}
