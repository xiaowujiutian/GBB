import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsPhoneNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PaymentSearchDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;

  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'])
  status?: string;

  @IsOptional()
  @IsEnum(['WECHAT', 'ALIPAY', 'CASH'])
  paymentType?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
