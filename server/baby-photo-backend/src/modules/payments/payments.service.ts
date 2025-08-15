import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { WxPayService } from './services/wx-pay.service';
import { PaymentNotificationService } from './services/payment-notification.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentSearchDto } from './dto/payment-search.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly wxPayService: WxPayService,
    private readonly notificationService: PaymentNotificationService,
  ) {}

  /**
   * 创建支付订单
   */
  async create(createPaymentDto: CreatePaymentDto) {
    try {
      // 1. 验证订单是否存在
      const order = await this.prisma.order.findUnique({
        where: { orderNo: createPaymentDto.orderNo },
        include: { user: true, package: true },
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      // 2. 检查是否已有未完成的支付
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          order: {
            orderNo: createPaymentDto.orderNo,
          },
          status: { in: ['PENDING', 'PROCESSING'] },
        },
      });

      if (existingPayment) {
        throw new ConflictException('订单已有待支付记录');
      }

      // 3. 创建支付记录
      const payment = await this.prisma.payment.create({
        data: {
          order: {
            connect: {
              orderNo: createPaymentDto.orderNo,
            },
          },
          amount: createPaymentDto.amount,
          paymentType: createPaymentDto.paymentType,
          status: 'PENDING',
        },
      });

      // 4. 调用微信支付API
      let paymentResult;
      if (createPaymentDto.paymentType === 'WECHAT') {
        paymentResult = await this.wxPayService.createPayment({
          outTradeNo: payment.id,
          description:
            createPaymentDto.description || `${order.package.name} - 支付`,
          amount: Number(createPaymentDto.amount) * 100, // 转为分
          openid: order.user.openid,
        });

        // 更新支付记录
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PROCESSING',
          },
        });
      }

      // 5. 构造返回数据
      const response = {
        payment_id: payment.id,
        order_no: createPaymentDto.orderNo,
        amount: Number(createPaymentDto.amount),
        status: 'PROCESSING',
        payment_info: paymentResult
          ? {
              prepay_id: paymentResult.prepay_id,
              pay_sign: paymentResult.paySign,
              timestamp: paymentResult.timeStamp,
              nonce_str: paymentResult.nonceStr,
              sign_type: paymentResult.signType,
            }
          : null,
      };

      this.logger.log(`支付订单创建成功: ${payment.id}`);

      return {
        code: 200,
        message: '支付订单创建成功',
        data: response,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(`创建支付订单失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建支付订单失败');
    }
  }

  /**
   * 处理微信支付回调
   */
  async handleWxPayNotify(body: Buffer, headers: Record<string, string>) {
    try {
      // 验证签名
      const isValid = await this.wxPayService.verifySignature(body, headers);
      if (!isValid) {
        throw new BadRequestException('签名验证失败');
      }

      // 解析回调数据
      const notifyData = await this.wxPayService.parseNotifyData(body);

      // 处理支付结果
      await this.handlePaymentResult(notifyData);

      return { code: 'SUCCESS', message: '成功' };
    } catch (error) {
      this.logger.error(`处理微信支付回调失败: ${error.message}`, error.stack);
      return { code: 'FAIL', message: error.message };
    }
  }

  /**
   * 获取支付列表
   */
  async findAll(searchDto: PaymentSearchDto) {
    const {
      page = 1,
      limit = 20,
      phone,
      status,
      startDate,
      endDate,
      paymentType,
      orderNo,
    } = searchDto;

    try {
      const where: any = {};

      // 手机号查询
      if (phone) {
        where.order = {
          user: { phone },
        };
      }

      // 订单号查询
      if (orderNo) {
        where.order = {
          ...where.order,
          orderNo,
        };
      }

      // 状态查询
      if (status) {
        where.status = status;
      }

      // 支付方式查询
      if (paymentType) {
        where.paymentType = paymentType;
      }

      // 时间范围查询
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          include: {
            order: {
              include: {
                user: {
                  select: { nickname: true, phone: true },
                },
                package: {
                  select: { name: true, price: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.payment.count({ where }),
      ]);

      return {
        code: 200,
        message: '查询成功',
        data: {
          payments: payments.map((payment) => ({
            payment_id: payment.id,
            order_no: payment.order.orderNo,
            amount: Number(payment.amount),
            payment_type: payment.paymentType,
            status: payment.status,
            transaction_id: payment.transactionId,
            paid_at: payment.paidAt,
            created_at: payment.createdAt,
            order_info: {
              user: payment.order.user,
              package: payment.order.package,
              total_amount: Number(payment.order.totalAmount),
            },
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`查询支付列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 通过手机号查找支付记录
   */
  async findByPhone(
    phone: string,
    pagination: { page: number; limit: number },
  ) {
    try {
      const cacheKey = this.cacheService.generateKey(
        'payment-phone',
        phone,
        pagination.page.toString(),
        pagination.limit.toString(),
      );

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const { page, limit } = pagination;

          const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
              where: {
                order: {
                  user: { phone },
                },
              },
              include: {
                order: {
                  include: {
                    package: {
                      select: { name: true, price: true },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
            this.prisma.payment.count({
              where: {
                order: {
                  user: { phone },
                },
              },
            }),
          ]);

          if (total === 0) {
            throw new NotFoundException('未找到相关支付记录');
          }

          return {
            code: 200,
            message: '查询成功',
            data: {
              payments: payments.map((payment) => ({
                payment_id: payment.id,
                order_no: payment.order.orderNo,
                amount: Number(payment.amount),
                payment_type: payment.paymentType,
                status: payment.status,
                transaction_id: payment.transactionId,
                paid_at: payment.paidAt,
                created_at: payment.createdAt,
                package_info: payment.order.package,
                order_amount: Number(payment.order.totalAmount),
              })),
              pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
              },
            },
          };
        },
        600, // 缓存10分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `通过手机号查找支付记录失败: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 通过订单号查找支付记录
   */
  async findByOrderNo(orderNo: string) {
    try {
      const cacheKey = this.cacheService.generateKey('payment-order', orderNo);

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const payments = await this.prisma.payment.findMany({
            where: {
              order: {
                orderNo,
              },
            },
            include: {
              order: {
                include: {
                  user: {
                    select: { nickname: true, phone: true },
                  },
                  package: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (payments.length === 0) {
            throw new NotFoundException('未找到相关支付记录');
          }

          return {
            code: 200,
            message: '查询成功',
            data: payments.map((payment) => ({
              payment_id: payment.id,
              order_no: payment.order.orderNo,
              amount: Number(payment.amount),
              payment_type: payment.paymentType,
              status: payment.status,
              transaction_id: payment.transactionId,
              paid_at: payment.paidAt,
              created_at: payment.createdAt,
              order_info: payment.order,
            })),
          };
        },
        600, // 缓存10分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `通过订单号查找支付记录失败: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 获取支付详情
   */
  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    return payment;
  }

  /**
   * 更新支付信息
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    // 首先检查支付记录是否存在
    await this.findOne(id);

    // 准备更新数据
    const data: any = { ...updatePaymentDto };
    // 如果有 paidAt 字段，转换为 Date 对象
    if (updatePaymentDto.paidAt) {
      data.paidAt = new Date(updatePaymentDto.paidAt);
    }

    // 更新支付记录
    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data,
      include: { order: true },
    });

    return updatedPayment;
  }

  /**
   * 申请退款
   */
  async refund(id: string, refundPaymentDto: RefundPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    // 调用退款接口，使用退款金额和原因
    const { refundAmount, refundReason } = refundPaymentDto;

    // TODO: 实现实际的退款API调用
    this.logger.log(`申请退款: 金额=${refundAmount}, 原因=${refundReason}`);

    // 更新支付状态为 REFUNDED
    await this.prisma.payment.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });

    return this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  /**
   * 取消支付
   */
  async cancel(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    // 更新支付状态为 CANCELED
    await this.prisma.payment.update({
      where: { id },
      data: { status: 'CANCELED' },
    });

    return this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  /**
   * 删除支付记录
   */
  async remove(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: 'Payment deleted successfully' };
  }

  /**
   * 获取支付状态
   */
  async getPaymentStatus(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: { status: true, transactionId: true, paidAt: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    return payment;
  }

  /**
   * 获取支付统计信息
   */
  async getPaymentStatistics(query: any) {
    const { startDate, endDate, paymentType } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (paymentType) {
      where.paymentType = paymentType;
    }

    const totalAmount = await this.prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    });

    const totalCount = await this.prisma.payment.count({ where });

    return {
      totalAmount: totalAmount._sum.amount || 0,
      totalCount,
    };
  }

  /**
   * 手动同步支付状态
   */
  async syncPaymentStatus(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    // TODO: 调用支付网关查询支付状态接口

    // 假设获取到的状态为 SUCCESS
    const newStatus = 'SUCCESS';

    await this.prisma.payment.update({
      where: { id },
      data: { status: newStatus },
    });

    return this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  // 私有辅助方法

  /**
   * 处理支付结果
   */
  private async handlePaymentResult(notifyData: any) {
    const { out_trade_no, transaction_id, trade_state, amount } = notifyData;

    const payment = await this.prisma.payment.findUnique({
      where: { id: out_trade_no },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    // 更新支付状态
    let status: string;
    let paidAt: Date | null = null;

    switch (trade_state) {
      case 'SUCCESS':
        status = 'PAID';
        paidAt = new Date();
        break;
      case 'CLOSED':
      case 'REVOKED':
        status = 'FAILED';
        break;
      case 'USERPAYING':
        status = 'PROCESSING';
        break;
      default:
        status = 'FAILED';
    }

    // 更新支付记录
    await this.prisma.payment.update({
      where: { id: out_trade_no },
      data: {
        status,
        transactionId: transaction_id,
        paidAt,
      },
    });

    // 如果支付成功，更新订单状态
    if (status === 'PAID') {
      await this.updateOrderAfterPayment(
        payment.order.orderNo,
        Number(amount.total) / 100,
      );

      // 发送支付成功通知
      await this.notificationService.sendPaymentSuccessNotification(
        payment.order.orderNo,
      );
    }

    this.logger.log(`支付状态更新: ${out_trade_no} -> ${status}`);
  }

  /**
   * 支付成功后更新订单
   */
  private async updateOrderAfterPayment(orderNo: string, paidAmount: number) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });

    if (!order) return;

    const newPaidAmount = Number(order.paidAmount) + paidAmount;
    const totalAmount = Number(order.totalAmount);

    let paymentStatus: string;
    if (newPaidAmount >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'PENDING';
    }

    await this.prisma.order.update({
      where: { orderNo },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus,
      },
    });

    // 清除相关缓存
    const cacheKeys = [
      this.cacheService.getOrderCacheKey(orderNo),
      this.cacheService.generateKey('payment-order', orderNo),
    ];

    await Promise.all(cacheKeys.map((key) => this.cacheService.del(key)));
  }

  /**
   * 生成支付ID
   */
  private generatePaymentId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `PAY${timestamp}${random}`;
  }
}
