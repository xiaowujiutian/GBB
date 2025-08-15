import { IsNumber, IsOptional, IsString, Min, Length } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @Min(0.01)
  refundAmount: number;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  refundReason?: string;
}
