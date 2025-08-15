// filepath: /home/liyong/gbb/server/baby-photo-backend/src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { WxLoginDto } from './dto/wx-login.dto';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * 微信小程序登录
   */
  @Post('wx-login')
  @ApiOperation({ summary: '微信小程序登录' })
  async wxLogin(@Body() wxLoginDto: WxLoginDto) {
    this.logger.log(`微信登录: ${JSON.stringify(wxLoginDto)}`);
    return this.usersService.wxLogin(wxLoginDto);
  }

  /**
   * 创建用户
   */
  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`创建用户: ${JSON.stringify(createUserDto)}`);
    return this.usersService.create(createUserDto);
  }

  /**
   * 获取所有用户（支持搜索和分页）
   */
  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  async findAll(@Query() searchDto: UserSearchDto) {
    this.logger.log(`查询用户列表: ${JSON.stringify(searchDto)}`);
    return this.usersService.findAll(searchDto);
  }

  /**
   * 通过手机号查找用户
   */
  @Get('by-phone/:phone')
  @ApiOperation({ summary: '根据电话号码获取用户' })
  @ApiResponse({ status: 200, description: '成功获取用户信息' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findByPhone(@Param('phone') phone: string) {
    this.logger.log(`通过手机号查找用户: ${phone}`);
    return this.usersService.findByPhone(phone);
  }

  /**
   * 通过昵称查找用户（支持模糊搜索）
   */
  @Get('by-nickname')
  @ApiOperation({ summary: '通过昵称查找用户' })
  async findByNickname(
    @Query('nickname') nickname: string,
    @Query('fuzzy') fuzzy?: string,
  ) {
    this.logger.log(`通过昵称查找用户: ${nickname}, 模糊搜索: ${fuzzy}`);
    const isFuzzy = fuzzy === 'true';
    return this.usersService.findByNickname(nickname, isFuzzy);
  }

  /**
   * 获取用户详情
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`获取用户详情: ${id}`);
    return this.usersService.findOne(id);
  }

  /**
   * 更新用户信息
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`更新用户: ${id}, 数据: ${JSON.stringify(updateUserDto)}`);
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * 删除用户
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async remove(@Param('id') id: string) {
    this.logger.log(`删除用户: ${id}`);
    return this.usersService.remove(id);
  }

  /**
   * 获取用户统计信息
   */
  @Get(':id/statistics')
  @ApiOperation({ summary: '获取用户统计信息' })
  async getUserStatistics(@Param('id') id: string) {
    this.logger.log(`获取用户统计信息: ${id}`);
    return this.usersService.getUserStatistics(id);
  }

  /**
   * 获取用户订单历史
   */
  @Get(':id/orders')
  @ApiOperation({ summary: '获取用户订单历史' })
  async getUserOrders(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`获取用户订单历史: ${id}`);
    return this.usersService.getUserOrders(id, {
      page: page || 1,
      limit: limit || 10,
    });
  }
}
