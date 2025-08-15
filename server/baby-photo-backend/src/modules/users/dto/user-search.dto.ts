import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsPhoneNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UserSearchDto {
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
  nickname?: string;

  @IsOptional()
  @IsString()
  fuzzy?: string;

  @IsOptional()
  @IsEnum([
    'created_at_asc',
    'created_at_desc',
    'nickname_asc',
    'nickname_desc',
    'last_login_asc',
    'last_login_desc',
  ])
  sort?: string = 'created_at_desc';
}
