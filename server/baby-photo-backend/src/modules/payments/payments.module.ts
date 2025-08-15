import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { CacheModule } from '../../shared/cache/cache.module';
import { WxPayService } from './services/wx-pay.service';
import { PaymentNotificationService } from './services/payment-notification.service';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WxPayService, PaymentNotificationService],
  exports: [PaymentsService, WxPayService],
})
export class PaymentsModule {}
