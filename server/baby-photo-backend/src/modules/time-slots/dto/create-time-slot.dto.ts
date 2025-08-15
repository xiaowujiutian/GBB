import { IsDateString, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimeSlotDto {
  @ApiProperty({
    description: '预约日期',
    example: '2024-08-15',
    format: 'date',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: '开始时间',
    example: '09:00:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: '开始时间格式必须为 HH:MM:SS',
  })
  startTime: string;

  @ApiProperty({
    description: '结束时间',
    example: '11:00:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: '结束时间格式必须为 HH:MM:SS',
  })
  endTime: string;
}
