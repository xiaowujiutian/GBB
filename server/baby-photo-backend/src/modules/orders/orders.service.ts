import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userOpenid, packageId, timeSlotId } = createOrderDto;

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { openid: userOpenid },
    });

    if (!user) {
      throw new NotFoundException(`User with openid ${userOpenid} not found`);
    }

    // 检查套餐是否存在
    const packageInfo = await this.prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageInfo) {
      throw new NotFoundException(`Package with id ${packageId} not found`);
    }

    // 检查时间槽是否可用（如果提供了timeSlotId）
    let timeSlot: any = null;
    if (timeSlotId) {
      timeSlot = await this.prisma.timeSlot.findUnique({
        where: { id: timeSlotId },
      });

      if (!timeSlot) {
        throw new NotFoundException(`TimeSlot with id ${timeSlotId} not found`);
      }

      if (timeSlot.isBooked) {
        throw new BadRequestException(
          `TimeSlot with id ${timeSlotId} is already booked`,
        );
      }
    }

    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 准备订单数据 - 修正字段映射
    const orderData: any = {
      orderNo,
      // 使用关联方式创建订单与用户的关系
      user: {
        connect: {
          openid: userOpenid,
        },
      },
      package: {
        connect: {
          id: packageId,
        },
      },
      totalAmount: createOrderDto.totalAmount,
      depositAmount: createOrderDto.depositAmount || 0,
      paidAmount: 0,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      childrenCount: createOrderDto.childrenCount || 1,
      notes: createOrderDto.notes,
    };

    // 如果提供了时间槽，添加关联
    if (timeSlotId) {
      orderData.timeSlot = {
        connect: {
          id: timeSlotId,
        },
      };
    }

    if (createOrderDto.appointmentDate) {
      orderData.appointmentDate = createOrderDto.appointmentDate;
    }

    // 创建订单
    const order = await this.prisma.order.create({
      data: orderData,
    });

    // 如果有时间槽，更新时间槽状态
    if (timeSlotId) {
      await this.prisma.timeSlot.update({
        where: { id: timeSlotId },
        data: { isBooked: true },
      });
    }

    return order;
  }

  async findAll() {
    return await this.prisma.order.findMany({
      include: {
        user: true,
        package: true,
        timeSlot: true,
        payments: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        package: true,
        timeSlot: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

  async findByOrderNo(orderNo: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
      include: {
        user: true,
        package: true,
        timeSlot: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with order number ${orderNo} not found`,
      );
    }

    return order;
  }

  // 为用户查找订单
  async findByUserOpenid(userOpenid: string) {
    return await this.prisma.order.findMany({
      where: {
        user: {
          openid: userOpenid,
        },
      },
      include: {
        package: true,
        timeSlot: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    // 首先检查订单是否存在
    const existingOrder = await this.findOne(id);

    // 如果更新了时间槽，需要处理旧的和新的时间槽状态
    if (
      updateOrderDto.timeSlotId &&
      updateOrderDto.timeSlotId !== existingOrder.timeSlotId
    ) {
      // 检查新的时间槽是否可用
      const newTimeSlot = await this.prisma.timeSlot.findUnique({
        where: { id: updateOrderDto.timeSlotId },
      });

      if (!newTimeSlot) {
        throw new NotFoundException(
          `TimeSlot with id ${updateOrderDto.timeSlotId} not found`,
        );
      }

      if (newTimeSlot.isBooked) {
        throw new BadRequestException(
          `TimeSlot with id ${updateOrderDto.timeSlotId} is already booked`,
        );
      }

      // 释放旧的时间槽（如果存在）
      if (existingOrder.timeSlotId) {
        await this.prisma.timeSlot.update({
          where: { id: existingOrder.timeSlotId },
          data: { isBooked: false },
        });
      }

      // 预订新的时间槽
      await this.prisma.timeSlot.update({
        where: { id: updateOrderDto.timeSlotId },
        data: { isBooked: true },
      });
    }

    // 准备更新数据
    const updateData: any = { ...updateOrderDto };

    // 如果有预约日期，确保是 Date 对象
    if (updateOrderDto.appointmentDate) {
      updateData.appointmentDate = new Date(updateOrderDto.appointmentDate);
    }

    // 更新订单 - 使用 orderNo 作为查询条件
    const updatedOrder = await this.prisma.order.update({
      where: { orderNo: id },
      data: updateData,
      include: {
        user: true,
        package: true,
        timeSlot: true,
        payments: true,
      },
    });

    return updatedOrder;
  }

  async findByPhone(phone: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          user: {
            phone: phone,
          },
        },
        include: {
          user: true,
          package: true,
          timeSlot: true,
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return orders;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to find orders by phone: ${errorMessage}`,
      );
    }
  }

  async findByPaymentStatus(paymentStatus: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          paymentStatus: paymentStatus,
        },
        include: {
          user: true,
          package: true,
          timeSlot: true,
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // 统计信息
      const totalOrders = orders.length;
      const totalAmount = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0,
      );
      const totalPaidAmount = orders.reduce(
        (sum, order) => sum + Number(order.paidAmount),
        0,
      );

      return {
        orders,
        statistics: {
          totalOrders,
          totalAmount,
          totalPaidAmount,
          paymentStatus,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to find orders by payment status: ${errorMessage}`,
      );
    }
  }

  private generateOrderNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
  }
}
