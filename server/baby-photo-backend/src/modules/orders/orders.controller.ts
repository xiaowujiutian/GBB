import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('订单管理')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '用户、套餐或时间槽不存在' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有订单' })
  @ApiResponse({ status: 200, description: '成功获取订单列表' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:userOpenid')
  @ApiOperation({ summary: '根据用户openid获取订单' })
  @ApiParam({ name: 'userOpenid', description: '用户openid' })
  @ApiResponse({ status: 200, description: '成功获取用户订单' })
  findByUserOpenid(@Param('userOpenid') userOpenid: string) {
    return this.ordersService.findByUserOpenid(userOpenid);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: '根据电话号码获取订单' })
  @ApiParam({ name: 'phone', description: '电话号码' })
  @ApiResponse({ status: 200, description: '成功获取用户订单' })
  @ApiResponse({ status: 404, description: '用户不存在或无订单' })
  findByPhone(@Param('phone') phone: string) {
    return this.ordersService.findByPhone(phone);
  }

  @Get('payment-status/:status')
  @ApiOperation({ summary: '根据支付状态获取订单统计' })
  @ApiParam({
    name: 'status',
    description: '支付状态 (CREATED, PENDING, PAID, FAILED, REFUNDED)',
  })
  @ApiResponse({ status: 200, description: '成功获取订单统计列表' })
  findByPaymentStatus(@Param('status') status: string) {
    return this.ordersService.findByPaymentStatus(status);
  }

  @Get('order-no/:orderNo')
  @ApiOperation({ summary: '根据订单号获取订单' })
  @ApiParam({ name: 'orderNo', description: '订单号' })
  @ApiResponse({ status: 200, description: '成功获取订单详情' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  findByOrderNo(@Param('orderNo') orderNo: string) {
    return this.ordersService.findByOrderNo(orderNo);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '成功获取订单详情' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新订单信息' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '订单更新成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
