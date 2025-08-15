import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ description: '用户openid' })
  @IsString()
  @Length(1, 100)
  userOpenid: string;

  @ApiProperty({ description: '套餐ID' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  packageId: number;

  @ApiProperty({ description: '时间段ID', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  timeSlotId?: number;

  @ApiProperty({ description: '预约日期', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  appointmentDate?: Date;

  @ApiProperty({ description: '总金额' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalAmount: number;

  @ApiProperty({ description: '定金金额', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  depositAmount?: number;

  @ApiProperty({ description: '客户姓名', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  customerName?: string;

  @ApiProperty({ description: '客户手机号', required: false })
  @IsOptional()
  @IsPhoneNumber('CN')
  customerPhone?: string;

  @ApiProperty({ description: '儿童数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  childrenCount?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;

  @ApiProperty({
    description: '支付类型',
    enum: ['DEPOSIT', 'FULL'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['DEPOSIT', 'FULL'])
  paymentType?: string;
}
