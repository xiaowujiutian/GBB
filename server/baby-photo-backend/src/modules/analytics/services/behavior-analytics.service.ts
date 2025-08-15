import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CacheService } from '../../../shared/cache/cache.service';

@Injectable()
export class BehaviorAnalyticsService {
  private readonly logger = new Logger(BehaviorAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 获取行为分析数据
   */
  async getAnalytics(query: any) {
    const { startDate, endDate } = query;

    try {
      const cacheKey = this.cacheService.getAnalyticsCacheKey(
        'behavior',
        `${startDate}-${endDate}`,
      );

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const where = this.buildDateFilter(startDate, endDate);

          const [orderTrends, paymentBehavior, conversionRates] =
            await Promise.all([
              this.getOrderTrends(where),
              this.getPaymentBehavior(where),
              this.getConversionRates(where),
            ]);

          return {
            code: 200,
            message: '获取成功',
            data: {
              order_trends: orderTrends,
              payment_behavior: paymentBehavior,
              conversion_rates: conversionRates,
              period: { start_date: startDate, end_date: endDate },
            },
          };
        },
        1800, // 缓存30分钟
      );
    } catch (error) {
      this.logger.error(`获取行为分析数据失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取概览统计数据
   */
  async getOverviewStats(query: any) {
    const { startDate, endDate } = query;
    const where = this.buildDateFilter(startDate, endDate);

    const [totalOrders, totalRevenue] = await Promise.all([
      this.prisma.order.count({ where }),
      this.getTotalRevenue(where),
    ]);

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
    };
  }

  // 私有方法

  private buildDateFilter(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    return where;
  }

  private async getOrderTrends(where: any) {
    const result = await this.prisma.order.groupBy({
      by: ['createdAt'],
      _count: true,
      _sum: {
        totalAmount: true,
      },
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return result.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      order_count: item._count,
      total_amount: Number(item._sum.totalAmount || 0),
    }));
  }

  private async getPaymentBehavior(where: any) {
    const [totalOrders, paidOrders, partialPaidOrders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({
        where: { ...where, paymentStatus: 'PAID' },
      }),
      this.prisma.order.count({
        where: { ...where, paymentStatus: 'PARTIAL' },
      }),
    ]);

    return {
      total_orders: totalOrders,
      paid_orders: paidOrders,
      partial_paid_orders: partialPaidOrders,
      payment_rate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
    };
  }

  private getConversionRates(where: any) {
    // 这里可以根据实际业务需求计算转化率
    // 例如：浏览->下单->支付的转化率
    // 记录查询条件以便后续扩展功能时使用
    this.logger.debug(`计算转化率，查询条件: ${JSON.stringify(where)}`);

    return Promise.resolve({
      browse_to_order: 15.5, // 示例数据
      order_to_payment: 85.2, // 示例数据
    });
  }

  private async getTotalRevenue(where: any) {
    const result = await this.prisma.order.aggregate({
      _sum: {
        paidAmount: true,
      },
      where,
    });

    return Number(result._sum.paidAmount || 0);
  }
}
