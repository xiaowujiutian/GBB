import { request } from './api';
import { TimeSlot, TimeSlotSearchParams, TimeSlotFormData, BatchCreateParams } from '@/types/timeSlot';
import { PaginationParams } from '@/types/common';

export const timeSlotService = {
  // 获取时间槽列表
  getTimeSlots: async (params: PaginationParams & TimeSlotSearchParams) => {
    // Mock data for development
    return {
      data: {
        list: [] as TimeSlot[],
        pagination: {
          current: params.page,
          pageSize: params.pageSize,
          total: 0,
        },
      },
    };
  },

  // 获取时间槽详情
  getTimeSlotById: (id: string) =>
    request.get<TimeSlot>(`/time-slots/${id}`),

  // 创建时间槽
  createTimeSlot: (data: TimeSlotFormData) =>
    request.post<TimeSlot>('/time-slots', data),

  // 批量创建时间槽
  batchCreateTimeSlots: (data: BatchCreateParams) =>
    request.post('/time-slots/batch', data),

  // 更新时间槽
  updateTimeSlot: (id: string, data: Partial<TimeSlotFormData>) =>
    request.put<TimeSlot>(`/time-slots/${id}`, data),

  // 删除时间槽
  deleteTimeSlot: (id: string) =>
    request.delete(`/time-slots/${id}`),

  // 批量删除时间槽
  batchDeleteTimeSlots: (ids: string[]) =>
    request.post('/time-slots/batch-delete', { ids }),

  // 获取可用时间槽
  getAvailableSlots: (params: { date: string; packageId?: string }) =>
    request.get<TimeSlot[]>('/time-slots/available', { params }),

  // 检查时间冲突
  checkConflict: (data: { date: string; startTime: string; endTime: string; excludeId?: string }) =>
    request.post('/time-slots/check-conflict', data),

  // 获取时间槽统计
  getTimeSlotStats: async () => {
    // Mock data for development
    return {
      data: {
        totalSlots: 0,
        availableSlots: 0,
        utilizationRate: 0,
        avgBookingRate: 0,
      },
    };
  },

  // 获取日历数据
  getCalendarData: async (_params: { year: number; month: number }) => {
    // Mock data for development
    return {
      data: {} as Record<string, TimeSlot[]>,
    };
  },

  // 复制时间槽
  copyTimeSlots: (params: { sourceDate: string; targetDates: string[] }) =>
    request.post('/time-slots/copy', params),
};
