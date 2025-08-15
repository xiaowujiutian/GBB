import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageSearchDto } from './dto/package-search.dto';

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 创建套餐
   */
  async create(createPackageDto: CreatePackageDto) {
    try {
      // 检查套餐名称是否已存在
      const existingPackage = await this.prisma.package.findFirst({
        where: { name: createPackageDto.name },
      });

      if (existingPackage) {
        throw new ConflictException('套餐名称已存在');
      }

      // 处理可选字段的默认值
      const packageData = {
        ...createPackageDto,
        deposit: createPackageDto.deposit ?? 0, // 如果没有提供定金，默认为0
        includes: createPackageDto.includes ?? [], // 如果没有提供包含内容，默认为空数组
      };

      const pkg = await this.prisma.package.create({
        data: packageData,
      });

      // 清除相关缓存
      await this.clearPackageListCache();

      this.logger.log(`套餐创建成功: ${pkg.id}`);

      return {
        code: 200,
        message: '套餐创建成功',
        data: pkg,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`创建套餐失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建套餐失败');
    }
  }

  /**
   * 获取套餐列表（支持搜索和分页）
   */
  async findAll(searchDto: PackageSearchDto) {
    const {
      page = 1,
      limit = 20,
      name,
      minPrice,
      maxPrice,
      sort = 'created_at_desc',
    } = searchDto;

    try {
      const where: any = {};

      // 名称查询
      if (name) {
        where.name = {
          contains: name,
          mode: 'insensitive',
        };
      }

      // 价格范围查询
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      // 排序配置
      const orderBy = this.buildOrderBy(sort);

      const [packages, total] = await Promise.all([
        this.prisma.package.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            _count: {
              select: {
                orders: true,
              },
            },
          },
        }),
        this.prisma.package.count({ where }),
      ]);

      const formattedPackages = packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: Number(pkg.price),
        deposit: Number(pkg.deposit),
        duration_minutes: pkg.durationMinutes,
        includes: pkg.includes,
        order_count: pkg._count.orders,
        created_at: pkg.createdAt,
      }));

      return {
        code: 200,
        message: '查询成功',
        data: {
          packages: formattedPackages,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`查询套餐列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 通过价格区间查找套餐
   */
  async findByPriceRange(
    minPrice?: number,
    maxPrice?: number,
    sort: string = 'price_asc',
  ) {
    try {
      const cacheKey = this.cacheService.generateKey(
        'package-price-range',
        (minPrice || 0).toString(),
        (maxPrice || 'max').toString(),
        sort,
      );

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const where: any = {};

          if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
          }

          const orderBy = this.buildOrderBy(sort);

          const packages = await this.prisma.package.findMany({
            where,
            orderBy,
            include: {
              _count: {
                select: {
                  orders: true,
                },
              },
            },
          });

          if (packages.length === 0) {
            throw new NotFoundException('未找到符合条件的套餐');
          }

          const formattedPackages = packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.price),
            deposit: Number(pkg.deposit),
            duration_minutes: pkg.durationMinutes,
            includes: pkg.includes,
            order_count: pkg._count.orders,
            created_at: pkg.createdAt,
          }));

          return {
            code: 200,
            message: '查找成功',
            data: {
              packages: formattedPackages,
              search_criteria: {
                min_price: minPrice,
                max_price: maxPrice,
                sort: sort,
              },
            },
          };
        },
        600, // 缓存10分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `通过价格区间查找套餐失败: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('查找失败');
    }
  }

  /**
   * 通过名称查找套餐
   */
  async findByName(name: string, fuzzy: boolean = false) {
    try {
      const cacheKey = this.cacheService.generateKey(
        'package-name',
        name,
        fuzzy.toString(),
      );

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const where = fuzzy
            ? {
                name: {
                  contains: name,
                  mode: 'insensitive' as const,
                },
              }
            : { name };

          const packages = await this.prisma.package.findMany({
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

          if (packages.length === 0) {
            throw new NotFoundException('未找到匹配的套餐');
          }

          const formattedPackages = packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.price),
            deposit: Number(pkg.deposit),
            duration_minutes: pkg.durationMinutes,
            includes: pkg.includes,
            order_count: pkg._count.orders,
            created_at: pkg.createdAt,
          }));

          return {
            code: 200,
            message: '查找成功',
            data: formattedPackages,
          };
        },
        600, // 缓存10分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`通过名称查找套餐失败: ${error.message}`, error.stack);
      throw new BadRequestException('查找失败');
    }
  }

  /**
   * 获取热门套餐
   */
  async getPopularPackages(limit: number = 10) {
    try {
      const cacheKey = this.cacheService.generateKey(
        'popular-packages',
        limit.toString(),
      );

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const packages = await this.prisma.package.findMany({
            include: {
              _count: {
                select: {
                  orders: true,
                },
              },
            },
            orderBy: {
              orders: {
                _count: 'desc',
              },
            },
            take: limit,
          });

          const formattedPackages = packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.price),
            deposit: Number(pkg.deposit),
            duration_minutes: pkg.durationMinutes,
            includes: pkg.includes,
            order_count: pkg._count.orders,
            popularity_score: this.calculatePopularityScore(pkg._count.orders),
            created_at: pkg.createdAt,
          }));

          return {
            code: 200,
            message: '获取成功',
            data: formattedPackages,
          };
        },
        1800, // 缓存30分钟
      );
    } catch (error) {
      this.logger.error(`获取热门套餐失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取失败');
    }
  }

  /**
   * 获取套餐详情
   */
  async findOne(id: number) {
    try {
      const cacheKey = this.cacheService.getPackageCacheKey(id);

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const pkg = await this.prisma.package.findUnique({
            where: { id },
            include: {
              orders: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                  orderNo: true,
                  totalAmount: true,
                  orderStatus: true,
                  createdAt: true,
                  user: {
                    select: {
                      nickname: true,
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

          if (!pkg) {
            throw new NotFoundException('套餐不存在');
          }

          const formattedPackage = {
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.price),
            deposit: Number(pkg.deposit),
            duration_minutes: pkg.durationMinutes,
            includes: pkg.includes,
            order_count: pkg._count.orders,
            recent_orders: pkg.orders.map((order) => ({
              order_no: order.orderNo,
              total_amount: Number(order.totalAmount),
              order_status: order.orderStatus,
              customer_name: order.user.nickname,
              created_at: order.createdAt,
            })),
            created_at: pkg.createdAt,
          };

          return {
            code: 200,
            message: '查询成功',
            data: formattedPackage,
          };
        },
        1800, // 缓存30分钟
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`获取套餐详情失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  /**
   * 更新套餐
   */
  async update(id: number, updatePackageDto: UpdatePackageDto) {
    try {
      // 检查套餐是否存在
      const existingPackage = await this.prisma.package.findUnique({
        where: { id },
      });

      if (!existingPackage) {
        throw new NotFoundException('套餐不存在');
      }

      // 如果更新名称，检查是否冲突
      if (
        updatePackageDto.name &&
        updatePackageDto.name !== existingPackage.name
      ) {
        const nameExists = await this.prisma.package.findFirst({
          where: {
            name: updatePackageDto.name,
            id: { not: id },
          },
        });

        if (nameExists) {
          throw new ConflictException('套餐名称已被使用');
        }
      }

      const pkg = await this.prisma.package.update({
        where: { id },
        data: updatePackageDto,
      });

      // 清除缓存
      const cacheKey = this.cacheService.getPackageCacheKey(id);
      await this.cacheService.del(cacheKey);
      await this.clearPackageListCache();

      this.logger.log(`套餐更新成功: ${id}`);

      return {
        code: 200,
        message: '更新成功',
        data: pkg,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(`更新套餐失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新失败');
    }
  }

  /**
   * 删除套餐
   */
  async remove(id: number) {
    try {
      // 检查套餐是否存在
      const pkg = await this.prisma.package.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      if (!pkg) {
        throw new NotFoundException('套餐不存在');
      }

      // 检查是否有相关订单
      if (pkg._count.orders > 0) {
        throw new BadRequestException('套餐有相关订单，无法删除');
      }

      await this.prisma.package.delete({
        where: { id },
      });

      // 清除缓存
      const cacheKey = this.cacheService.getPackageCacheKey(id);
      await this.cacheService.del(cacheKey);
      await this.clearPackageListCache();

      this.logger.log(`套餐删除成功: ${id}`);

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
      this.logger.error(`删除套餐失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除失败');
    }
  }

  /**
   * 获取套餐统计信息
   */
  async getPackageStatistics(id: number) {
    try {
      const cacheKey = this.cacheService.generateKey(
        'package-stats',
        id.toString(),
      );

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const pkg = await this.prisma.package.findUnique({
            where: { id },
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

          if (!pkg) {
            throw new NotFoundException('套餐不存在');
          }

          const totalOrders = pkg.orders.length;
          const completedOrders = pkg.orders.filter(
            (order) => order.orderStatus === 'COMPLETED',
          ).length;

          const totalRevenue = pkg.orders.reduce((sum, order) => {
            const paidAmount = order.payments.reduce(
              (paySum, payment) => paySum + Number(payment.amount),
              0,
            );
            return sum + paidAmount;
          }, 0);

          const averageOrderValue =
            totalOrders > 0 ? totalRevenue / totalOrders : 0;

          const statistics = {
            package_info: {
              id: pkg.id,
              name: pkg.name,
              price: Number(pkg.price),
            },
            order_statistics: {
              total_orders: totalOrders,
              completed_orders: completedOrders,
              completion_rate:
                totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
            },
            revenue_statistics: {
              total_revenue: totalRevenue,
              average_order_value: averageOrderValue,
            },
            popularity_metrics: {
              popularity_score: this.calculatePopularityScore(totalOrders),
              market_share: await this.calculateMarketShare(id, totalOrders),
            },
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
      this.logger.error(`获取套餐统计信息失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询失败');
    }
  }

  // 私有辅助方法

  private buildOrderBy(sort: string) {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' as const };
      case 'price_desc':
        return { price: 'desc' as const };
      case 'name_asc':
        return { name: 'asc' as const };
      case 'name_desc':
        return { name: 'desc' as const };
      case 'created_at_asc':
        return { createdAt: 'asc' as const };
      case 'created_at_desc':
        return { createdAt: 'desc' as const };
      case 'popularity':
        return { orders: { _count: 'desc' as const } };
      default:
        return { createdAt: 'desc' as const };
    }
  }

  private calculatePopularityScore(orderCount: number): number {
    // 简单的热度计算公式
    return Math.min(100, orderCount * 10);
  }

  private async calculateMarketShare(
    packageId: number,
    orderCount: number,
  ): Promise<number> {
    const totalOrders = await this.prisma.order.count();
    return totalOrders > 0 ? (orderCount / totalOrders) * 100 : 0;
  }

  private async clearPackageListCache() {
    // 清除套餐列表相关的缓存
    const cacheKeys = ['popular-packages', 'package-price-range'];

    for (const keyPrefix of cacheKeys) {
      await this.cacheService.deleteByPattern(`${keyPrefix}:*`);
    }
  }
}
