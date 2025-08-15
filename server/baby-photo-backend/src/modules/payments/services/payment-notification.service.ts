import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class PaymentNotificationService {
  private readonly logger = new Logger(PaymentNotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 发送支付成功通知
   */
  async sendPaymentSuccessNotification(orderNo: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { orderNo },
        include: {
          user: true,
          package: true,
        },
      });

      if (!order) {
        this.logger.warn(`订单不存在: ${orderNo}`);
        return;
      }

      // 发送微信模板消息
      this.sendWxTemplateMessage({
        openid: order.user.openid,
        templateId: 'payment_success_template_id',
        data: {
          orderNo: order.orderNo,
          packageName: order.package.name,
          amount: order.totalAmount.toString(),
          appointmentDate:
            order.appointmentDate?.toISOString().split('T')[0] || '',
        },
      });

      this.logger.log(`支付成功通知已发送: ${orderNo}`);
    } catch (error) {
      this.logger.error(`发送支付成功通知失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 发送退款成功通知
   */
  async sendRefundSuccessNotification(orderNo: string, refundAmount: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { orderNo },
        include: { user: true },
      });

      if (!order) {
        this.logger.warn(`订单不存在: ${orderNo}`);
        return;
      }

      // 发送微信模板消息
      this.sendWxTemplateMessage({
        openid: order.user.openid,
        templateId: 'refund_success_template_id',
        data: {
          orderNo: order.orderNo,
          refundAmount: refundAmount.toString(),
          refundTime: new Date().toISOString(),
        },
      });

      this.logger.log(`退款成功通知已发送: ${orderNo}`);
    } catch (error) {
      this.logger.error(`发送退款成功通知失败: ${error.message}`, error.stack);
    }
  }

  // 私有方法
  private sendWxTemplateMessage(params: {
    openid: string;
    templateId: string;
    data: Record<string, string>;
  }) {
    // TODO: 实现微信模板消息发送
    this.logger.debug(`发送模板消息: ${JSON.stringify(params)}`);
  }
}
