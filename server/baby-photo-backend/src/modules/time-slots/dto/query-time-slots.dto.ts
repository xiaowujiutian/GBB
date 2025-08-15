import { IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryTimeSlotsDto {
  @ApiProperty({
    description: '开始日期',
    required: false,
    example: '2024-08-15',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '结束日期',
    required: false,
    example: '2024-08-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '是否已被预订',
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isBooked?: boolean;

  @ApiProperty({
    description: '排序方式',
    enum: ['date_asc', 'date_desc', 'time_asc', 'time_desc'],
    required: false,
    default: 'date_asc',
  })
  @IsOptional()
  @IsEnum(['date_asc', 'date_desc', 'time_asc', 'time_desc'])
  sortBy?: string;
}
