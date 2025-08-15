import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({ description: '套餐名称' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '套餐描述', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: '套餐价格' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: '定金金额', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  deposit?: number;

  @ApiProperty({ description: '拍摄时长（分钟）' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationMinutes: number;

  @ApiProperty({
    description: '套餐包含内容',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];
}
