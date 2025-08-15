import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    description: '订单状态',
    enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  orderStatus?: string;

  @ApiProperty({
    description: '支付状态',
    enum: ['CREATED', 'PAID_DEPOSIT', 'PAID_FULL', 'REFUNDED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['CREATED', 'PAID_DEPOSIT', 'PAID_FULL', 'REFUNDED'])
  paymentStatus?: string;

  @ApiProperty({ description: '已支付金额', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  paidAmount?: number;
}
