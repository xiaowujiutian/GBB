import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PackageSearchDto {
  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: '套餐名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '最低价格', required: false })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: '最高价格', required: false })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: '排序方式',
    enum: [
      'price_asc',
      'price_desc',
      'name_asc',
      'name_desc',
      'created_at_asc',
      'created_at_desc',
      'popularity',
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'price_asc',
    'price_desc',
    'name_asc',
    'name_desc',
    'created_at_asc',
    'created_at_desc',
    'popularity',
  ])
  sort?: string = 'created_at_desc';
}
