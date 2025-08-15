import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({ description: '订单编号' })
  @IsString()
  @Length(1, 100)
  orderNo: string;

  @ApiProperty({
    description: '支付类型',
    enum: ['WECHAT', 'ALIPAY', 'CASH'],
    example: 'WECHAT',
  })
  @IsString()
  @IsEnum(['WECHAT', 'ALIPAY', 'CASH'])
  paymentType: string;

  @ApiProperty({
    description: '支付金额',
    example: 299.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: '订单描述',
    example: '这是一个测试订单',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  description?: string;
}
