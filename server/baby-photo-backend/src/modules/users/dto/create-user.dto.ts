import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 100)
  openid: string;

  @IsString()
  @Length(1, 50)
  nickname: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  remark?: string;
}
