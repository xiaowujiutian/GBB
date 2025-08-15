import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { WxLoginDto } from './dto/wx-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import axios from 'axios';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 微信小程序登录
   */
  async wxLogin(wxLoginDto: WxLoginDto) {
    const { code, userInfo } = wxLoginDto;

    try {
      // 1. 通过code获取openid
      const openid = await this.getOpenidByCode(code);

      // 2. 查找或创建用户
      let user = await this.prisma.user.findUnique({
        where: { openid },
      });

      if (!user) {
        // 创建新用户
        user = await this.prisma.user.create({
          data: {
            openid,
            nickname: userInfo?.nickName || '微信用户',
            avatar: userInfo?.avatarUrl || '',
            phone: '', // 小程序登录时可能没有手机号
          },
        });
        this.logger.log(`创建新用户: ${openid}`);
      } else {
        // 更新用户信息
        if (userInfo) {
          user = await this.prisma.user.update({
            where: { openid },
            data: {
              nickname: userInfo.nickName || user.nickname,
              avatar: userInfo.avatarUrl || user.avatar,
            },
          });
        }
        this.logger.log(`用户登录: ${openid}`);
      }

      // 3. 生成会话token（这里简化处理，实际应该使用JWT）
      const token = this.generateToken(user.openid);

      // 4. 缓存用户信息
      const cacheKey = this.cacheService.getUserCacheKey(user.openid);
      this.cacheService.set(cacheKey, user, 3600); // 缓存1小时

      return {
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            openid: user.openid,
            nickname: user.nickname,
            avatar: user.avatar,
            phone: user.phone,
          },
        },
      };
    } catch (error) {
      this.logger.error(`微信登录失败: ${error.message}`, error.stack);
      throw new BadRequestException('登录失败，请稍后重试');
    }
  }

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto) {
    try {
      // 检查手机号是否已存在
      if (createUserDto.phone) {
        const existingUser = await this.prisma.user.findFirst({
          where: { phone: createUserDto.phone },
        });

        if (existingUser) {
          throw new ConflictException('手机号已被注册');
        }
      }

      // 检查openid是否已存在
      if (createUserDto.openid) {
        const existingUser = await this.prisma.user.findUnique({
          where: { openid: createUserDto.openid },
        });

        if (existingUser) {
          throw new ConflictException('用户已存在');
        }
      }

      const user = await this.prisma.user.create({
        data: createUserDto,
      });

      this.logger.log(`用户创建成功: ${user.openid}`);

      return {
        code: 200,
        message: '用户创建成功',
        data: user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`创建用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建用户失败');
    }
  }

  /**
   * 获取用户列表（支持搜索和分页）
   */
  async findAll(searchDto: UserSearchDto) {
    const {
      page = 1,
      limit = 20,
      phone,
      nickname,
      fuzzy,
      sort = 'created_at_desc',
    } = searchDto;

    try {
      const where: any = {};

      // 手机号查询
      if (phone) {
        where.phone = phone;
      }

      // 昵称查询
      if (nickname) {
        if (fuzzy === 'true') {
          where.nickname = {
            contains: nickname,
            mode: 'insensitive',
          };
        } else {
          where.nickname = nickname;
        }
      }

      // 模糊搜索（全局搜索）
      if (fuzzy && !phone && !nickname) {
        where.OR = [
          {
            nickname: {
              contains: fuzzy,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: fuzzy,
            },
          },
        ];
      }

      // 排序配置
      const orderBy = this.buildOrderBy(sort);

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            openid: true,
            nickname: true,
            avatar: true,
            phone: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
              },
            },
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        code: 200,
        message: '查询成功',
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`查询用户列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 通过手机号查找用户
   */
  async findByPhone(phone: string) {
    try {
      const cacheKey = this.cacheService.generateKey('user-phone', phone);

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const users = await this.prisma.user.findMany({
            where: { phone },
            include: {
              _count: {
                select: {
                  orders: true,
                },
              },
            },
          });

          if (users.length === 0) {
            throw new NotFoundException('未找到匹配的用户');
          }

          return {
            code: 200,
            message: '查询成功',
            data: users,
          };
        },
        600, // 缓存10分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `通过手机号查找用户失败: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 通过昵称查找用户
   */
  async findByNickname(nickname: string, fuzzy: boolean = false) {
    try {
      const cacheKey = this.cacheService.generateKey(
        'user-nickname',
        nickname,
        fuzzy.toString(),
      );

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const where = fuzzy
            ? {
                nickname: {
                  contains: nickname,
                  mode: 'insensitive' as const,
                },
              }
            : { nickname };

          const users = await this.prisma.user.findMany({
            where,
            include: {
              _count: {
                select: {
                  orders: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (users.length === 0) {
            throw new NotFoundException('未找到匹配的用户');
          }

          return {
            code: 200,
            message: '查询成功',
            data: users,
          };
        },
        600, // 缓存10分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`通过昵称查找用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 获取用户详情
   */
  async findOne(id: string) {
    try {
      const cacheKey = this.cacheService.getUserCacheKey(id);

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const user = await this.prisma.user.findUnique({
            where: { openid: id },
            include: {
              orders: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                  package: {
                    select: {
                      name: true,
                      price: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  orders: true,
                },
              },
            },
          });

          if (!user) {
            throw new NotFoundException('用户不存在');
          }

          return {
            code: 200,
            message: '查询成功',
            data: user,
          };
        },
        1800, // 缓存30分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`获取用户详情失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 更新用户信息
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // 检查用户是否存在
      const existingUser = await this.prisma.user.findUnique({
        where: { openid: id },
      });

      if (!existingUser) {
        throw new NotFoundException('用户不存在');
      }

      // 如果更新手机号，检查是否冲突
      if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
        const phoneExists = await this.prisma.user.findFirst({
          where: {
            phone: updateUserDto.phone,
            openid: { not: id },
          },
        });

        if (phoneExists) {
          throw new ConflictException('手机号已被其他用户使用');
        }
      }

      const user = await this.prisma.user.update({
        where: { openid: id },
        data: updateUserDto,
      });

      // 清除缓存
      const cacheKey = this.cacheService.getUserCacheKey(id);
      this.cacheService.del(cacheKey);

      this.logger.log(`用户更新成功: ${id}`);

      return {
        code: 200,
        message: '更新成功',
        data: user,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新失败');
    }
  }

  /**
   * 删除用户
   */
  async remove(id: string) {
    try {
      // 检查用户是否存在
      const user = await this.prisma.user.findUnique({
        where: { openid: id },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      // 检查是否有相关订单
      if (user._count.orders > 0) {
        throw new BadRequestException('用户有相关订单，无法删除');
      }

      await this.prisma.user.delete({
        where: { openid: id },
      });

      // 清除缓存
      const cacheKey = this.cacheService.getUserCacheKey(id);
      this.cacheService.del(cacheKey);

      this.logger.log(`用户删除成功: ${id}`);

      return {
        code: 200,
        message: '删除成功',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`删除用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除失败');
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStatistics(id: string) {
    try {
      const cacheKey = this.cacheService.generateKey('user-stats', id);

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const user = await this.prisma.user.findUnique({
            where: { openid: id },
            include: {
              orders: {
                include: {
                  payments: {
                    where: { status: 'PAID' },
                  },
                },
              },
            },
          });

          if (!user) {
            throw new NotFoundException('用户不存在');
          }

          const totalOrders = user.orders.length;
          const totalSpent = user.orders.reduce((sum, order) => {
            const paidAmount = order.payments.reduce(
              (paySum, payment) => paySum + Number(payment.amount),
              0,
            );
            return sum + paidAmount;
          }, 0);

          const completedOrders = user.orders.filter(
            (order) => order.orderStatus === 'COMPLETED',
          ).length;

          const averageOrderValue =
            totalOrders > 0 ? totalSpent / totalOrders : 0;

          const statistics = {
            total_orders: totalOrders,
            completed_orders: completedOrders,
            total_spent: totalSpent,
            average_order_value: averageOrderValue,
            first_order_date:
              totalOrders > 0
                ? user.orders.sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime(),
                  )[0].createdAt
                : null,
            last_order_date:
              totalOrders > 0
                ? user.orders.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )[0].createdAt
                : null,
            customer_loyalty_level: this.calculateLoyaltyLevel(
              totalOrders,
              totalSpent,
            ),
          };

          return {
            code: 200,
            message: '查询成功',
            data: statistics,
          };
        },
        1800, // 缓存30分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`获取用户统计信息失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 获取用户订单历史
   */
  async getUserOrders(id: string, pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;

    try {
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where: { user: { openid: id } },
          include: {
            package: true,
            timeSlot: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.order.count({
          where: { user: { openid: id } },
        }),
      ]);

      return {
        code: 200,
        message: '查询成功',
        data: {
          orders,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`获取用户订单历史失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 管理员登录
   */
  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { username, password } = adminLoginDto;

    // 硬编码的管理员账户（开发环境）
    const adminCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'administrator', password: '123456' },
    ];

    const validAdmin = adminCredentials.find(
      (admin) => admin.username === username && admin.password === password,
    );

    if (!validAdmin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 查找或创建管理员用户记录
    let adminUser = await this.prisma.user.findUnique({
      where: { openid: `admin-${username}` },
    });

    if (!adminUser) {
      adminUser = await this.prisma.user.create({
        data: {
          openid: `admin-${username}`,
          nickname: username === 'admin' ? '系统管理员' : '超级管理员',
          phone: username === 'admin' ? '18888888888' : '18999999999',
        },
      });
    }

    return {
      success: true,
      message: '登录成功',
      data: {
        id: adminUser.id,
        openid: adminUser.openid,
        nickname: adminUser.nickname,
        phone: adminUser.phone,
        isAdmin: true,
        token: `admin-token-${Date.now()}`, // 简单的token，生产环境请使用JWT
      },
    };
  }

  // 私有辅助方法

  /**
   * 通过code获取微信openid
   */
  private async getOpenidByCode(code: string): Promise<string> {
    const appId = process.env.WX_APP_ID;
    const appSecret = process.env.WX_APP_SECRET;

    if (!appId || !appSecret) {
      throw new BadRequestException('微信配置未完成');
    }

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session`,
        {
          params: {
            appid: appId,
            secret: appSecret,
            js_code: code,
            grant_type: 'authorization_code',
          },
        },
      );

      if (response.data.errcode) {
        throw new Error(response.data.errmsg);
      }

      return response.data.openid;
    } catch (error) {
      this.logger.error(`获取openid失败: ${error.message}`, error.stack);
      throw new BadRequestException('微信登录失败');
    }
  }

  /**
   * 生成用户token
   */
  private generateToken(openid: string): string {
    // 这里简化处理，实际应该使用JWT
    return Buffer.from(`${openid}:${Date.now()}`).toString('base64');
  }

  /**
   * 构建排序条件
   */
  private buildOrderBy(sort: string) {
    switch (sort) {
      case 'created_at_asc':
        return { createdAt: 'asc' as const };
      case 'created_at_desc':
        return { createdAt: 'desc' as const };
      case 'nickname_asc':
        return { nickname: 'asc' as const };
      case 'nickname_desc':
        return { nickname: 'desc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  }

  /**
   * 计算用户忠诚度等级
   */
  private calculateLoyaltyLevel(
    totalOrders: number,
    totalSpent: number,
  ): string {
    if (totalOrders >= 10 && totalSpent >= 5000) {
      return 'VIP';
    } else if (totalOrders >= 5 && totalSpent >= 2000) {
      return '金牌客户';
    } else if (totalOrders >= 2 && totalSpent >= 500) {
      return '银牌客户';
    } else if (totalOrders >= 1) {
      return '普通客户';
    } else {
      return '新客户';
    }
  }
}
