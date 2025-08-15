import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentSearchDto } from './dto/payment-search.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@ApiTags('支付管理')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * 创建支付订单
   */
  @Post()
  @ApiOperation({ summary: '创建支付记录' })
  @ApiResponse({ status: 201, description: '支付记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    this.logger.log(`创建支付订单: ${JSON.stringify(createPaymentDto)}`);
    return this.paymentsService.create(createPaymentDto);
  }

  /**
   * 微信支付回调
   */
  @Post('wx-notify')
  async wxPayNotify(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log('收到微信支付回调');
    return this.paymentsService.handleWxPayNotify(body, headers);
  }

  /**
   * 获取支付列表（支持搜索和分页）
   */
  @Get()
  @ApiOperation({ summary: '获取所有支付记录' })
  @ApiResponse({ status: 200, description: '成功获取支付记录列表' })
  async findAll(@Query() searchDto: PaymentSearchDto) {
    this.logger.log(`查询支付列表: ${JSON.stringify(searchDto)}`);
    return this.paymentsService.findAll(searchDto);
  }

  /**
   * 通过手机号查找支付记录
   */
  @Get('by-phone/:phone')
  async findByPhone(@Param('phone') phone: string, @Query() query: any) {
    this.logger.log(`通过手机号查找支付记录: ${phone}`);
    const { page = 1, limit = 20 } = query;
    return this.paymentsService.findByPhone(phone, {
      page: +page,
      limit: +limit,
    });
  }

  /**
   * 通过订单号查找支付记录
   */
  @Get('by-order/:orderNo')
  async findByOrderNo(@Param('orderNo') orderNo: string) {
    this.logger.log(`通过订单号查找支付记录: ${orderNo}`);
    return this.paymentsService.findByOrderNo(orderNo);
  }

  /**
   * 查询支付状态
   */
  @Get(':id/status')
  async getPaymentStatus(@Param('id') id: string) {
    this.logger.log(`查询支付状态: ${id}`);
    return this.paymentsService.getPaymentStatus(id);
  }

  /**
   * 获取支付详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`获取支付详情: ${id}`);
    return this.paymentsService.findOne(id);
  }

  /**
   * 更新支付信息
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    this.logger.log(
      `更新支付信息: ${id}, 数据: ${JSON.stringify(updatePaymentDto)}`,
    );
    return this.paymentsService.update(id, updatePaymentDto);
  }

  /**
   * 申请退款
   */
  @Post(':id/refund')
  async refund(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    this.logger.log(
      `申请退款: ${id}, 数据: ${JSON.stringify(refundPaymentDto)}`,
    );
    return this.paymentsService.refund(id, refundPaymentDto);
  }

  /**
   * 取消支付
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    this.logger.log(`取消支付: ${id}`);
    return this.paymentsService.cancel(id);
  }

  /**
   * 删除支付记录
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`删除支付记录: ${id}`);
    return this.paymentsService.remove(id);
  }

  /**
   * 获取支付统计信息
   */
  @Get('statistics/overview')
  async getPaymentStatistics(@Query() query: any) {
    this.logger.log('获取支付统计信息');
    return this.paymentsService.getPaymentStatistics(query);
  }

  /**
   * 手动同步支付状态
   */
  @Post(':id/sync-status')
  async syncPaymentStatus(@Param('id') id: string) {
    this.logger.log(`手动同步支付状态: ${id}`);
    return this.paymentsService.syncPaymentStatus(id);
  }
}
