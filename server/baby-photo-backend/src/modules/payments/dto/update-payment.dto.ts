import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional, IsEnum, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({
    description: '支付状态',
    enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'])
  status?: string;

  @ApiProperty({
    description: '第三方交易ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    description: '支付完成时间',
    example: '2024-08-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  paidAt?: Date;
}
