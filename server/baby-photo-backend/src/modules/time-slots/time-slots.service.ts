import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { QueryTimeSlotsDto } from './dto/query-time-slots.dto';
import { CreateBatchTimeSlotsDto } from './dto/create-batch-time-slots.dto';
import type { TimeSlot } from '@prisma/client';

@Injectable()
export class TimeSlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlot> {
    try {
      // 验证时间有效性
      this.validateTimeSlot(createTimeSlotDto);

      // 检查时间段是否已存在
      await this.checkTimeSlotConflict(createTimeSlotDto);

      const timeSlot = await this.prisma.timeSlot.create({
        data: {
          date: new Date(createTimeSlotDto.date),
          startTime: new Date(`1970-01-01T${createTimeSlotDto.startTime}Z`),
          endTime: new Date(`1970-01-01T${createTimeSlotDto.endTime}Z`),
        },
      });

      return timeSlot;
    } catch (error: unknown) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to create time slot: ${errorMessage}`,
      );
    }
  }

  async createBatch(
    createBatchDto: CreateBatchTimeSlotsDto,
  ): Promise<TimeSlot[]> {
    try {
      const timeSlots: TimeSlot[] = [];

      // 为每个日期和时间段组合创建时间槽
      for (const date of createBatchDto.dates) {
        for (const timeRange of createBatchDto.timeRanges) {
          const timeSlotDto = {
            date,
            startTime: timeRange.startTime,
            endTime: timeRange.endTime,
          };

          // 验证时间有效性
          this.validateTimeSlot(timeSlotDto);

          // 检查是否已存在（跳过已存在的，不抛出异常）
          const existing = await this.findExistingTimeSlot(timeSlotDto);
          if (existing) {
            continue;
          }

          const timeSlot = await this.prisma.timeSlot.create({
            data: {
              date: new Date(date),
              startTime: new Date(`1970-01-01T${timeRange.startTime}Z`),
              endTime: new Date(`1970-01-01T${timeRange.endTime}Z`),
            },
          });

          timeSlots.push(timeSlot);
        }
      }

      return timeSlots;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to create batch time slots: ${errorMessage}`,
      );
    }
  }

  async findAll(query: QueryTimeSlotsDto): Promise<TimeSlot[]> {
    try {
      const where: any = {};

      // 构建查询条件
      if (query.startDate || query.endDate) {
        where.date = {};
        if (query.startDate) {
          where.date.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.date.lte = new Date(query.endDate);
        }
      }

      if (query.isBooked !== undefined) {
        where.isBooked = query.isBooked;
      }

      // 构建排序条件
      let orderBy: any = { date: 'asc', startTime: 'asc' };
      if (query.sortBy) {
        switch (query.sortBy) {
          case 'date_desc':
            orderBy = { date: 'desc', startTime: 'asc' };
            break;
          case 'time_asc':
            orderBy = { startTime: 'asc', date: 'asc' };
            break;
          case 'time_desc':
            orderBy = { startTime: 'desc', date: 'asc' };
            break;
          default:
            orderBy = { date: 'asc', startTime: 'asc' };
        }
      }

      const timeSlots = await this.prisma.timeSlot.findMany({
        where,
        orderBy,
        include: {
          orders: {
            select: {
              id: true,
              orderNo: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                },
              },
            },
          },
        },
      });

      return timeSlots;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to fetch time slots: ${errorMessage}`,
      );
    }
  }

  async findOne(id: number): Promise<TimeSlot> {
    try {
      const timeSlot = await this.prisma.timeSlot.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                },
              },
              package: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!timeSlot) {
        throw new NotFoundException(`Time slot with id ${id} not found`);
      }

      return timeSlot;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to find time slot: ${errorMessage}`,
      );
    }
  }

  async findAvailable(date?: string): Promise<TimeSlot[]> {
    try {
      const where: any = { isBooked: false };

      if (date) {
        where.date = new Date(date);
      } else {
        // 默认只显示今天及以后的可用时间槽
        where.date = {
          gte: new Date(),
        };
      }

      const timeSlots = await this.prisma.timeSlot.findMany({
        where,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      });

      return timeSlots;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to find available time slots: ${errorMessage}`,
      );
    }
  }

  async update(
    id: number,
    updateTimeSlotDto: UpdateTimeSlotDto,
  ): Promise<TimeSlot> {
    try {
      // 检查时间槽是否存在
      await this.findOne(id);

      // 如果更新时间信息，需要验证
      if (
        updateTimeSlotDto.date ||
        updateTimeSlotDto.startTime ||
        updateTimeSlotDto.endTime
      ) {
        const currentTimeSlot = await this.prisma.timeSlot.findUnique({
          where: { id },
        });

        if (!currentTimeSlot) {
          throw new NotFoundException(`Time slot with id ${id} not found`);
        }

        const updatedData = {
          date:
            updateTimeSlotDto.date ||
            currentTimeSlot.date.toISOString().split('T')[0],
          startTime:
            updateTimeSlotDto.startTime ||
            currentTimeSlot.startTime.toTimeString().split(' ')[0],
          endTime:
            updateTimeSlotDto.endTime ||
            currentTimeSlot.endTime.toTimeString().split(' ')[0],
        };

        this.validateTimeSlot(updatedData);
      }

      const data: any = {};
      if (updateTimeSlotDto.date) {
        data.date = new Date(updateTimeSlotDto.date);
      }
      if (updateTimeSlotDto.startTime) {
        data.startTime = new Date(`1970-01-01T${updateTimeSlotDto.startTime}Z`);
      }
      if (updateTimeSlotDto.endTime) {
        data.endTime = new Date(`1970-01-01T${updateTimeSlotDto.endTime}Z`);
      }
      if (updateTimeSlotDto.isBooked !== undefined) {
        data.isBooked = updateTimeSlotDto.isBooked;
      }

      const updatedTimeSlot = await this.prisma.timeSlot.update({
        where: { id },
        data,
        include: {
          orders: true,
        },
      });

      return updatedTimeSlot;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to update time slot: ${errorMessage}`,
      );
    }
  }

  async remove(id: number): Promise<TimeSlot> {
    try {
      // 检查时间槽是否存在并包含订单信息
      const timeSlot = await this.prisma.timeSlot.findUnique({
        where: { id },
        include: { orders: true },
      });

      if (!timeSlot) {
        throw new NotFoundException(`Time slot with id ${id} not found`);
      }

      // 检查是否有相关订单
      if (timeSlot.orders && timeSlot.orders.length > 0) {
        throw new BadRequestException(
          'Cannot delete time slot with existing orders',
        );
      }

      const deletedTimeSlot = await this.prisma.timeSlot.delete({
        where: { id },
      });

      return deletedTimeSlot;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to delete time slot: ${errorMessage}`,
      );
    }
  }

  private validateTimeSlot(data: {
    date: string;
    startTime: string;
    endTime: string;
  }): void {
    const date = new Date(data.date);
    const startTime = new Date(`1970-01-01T${data.startTime}Z`);
    const endTime = new Date(`1970-01-01T${data.endTime}Z`);

    // 检查日期是否为未来日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      throw new BadRequestException('Date cannot be in the past');
    }

    // 检查结束时间是否晚于开始时间
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // 检查时间段是否合理（至少30分钟）
    const durationMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationMinutes < 30) {
      throw new BadRequestException(
        'Time slot duration must be at least 30 minutes',
      );
    }
  }

  private async checkTimeSlotConflict(data: {
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<void> {
    const existing = await this.findExistingTimeSlot(data);
    if (existing) {
      throw new ConflictException(
        'Time slot already exists for this date and time',
      );
    }
  }

  private async findExistingTimeSlot(data: {
    date: string;
    startTime: string;
    endTime: string;
  }) {
    return await this.prisma.timeSlot.findFirst({
      where: {
        date: new Date(data.date),
        startTime: new Date(`1970-01-01T${data.startTime}Z`),
        endTime: new Date(`1970-01-01T${data.endTime}Z`),
      },
    });
  }
}
