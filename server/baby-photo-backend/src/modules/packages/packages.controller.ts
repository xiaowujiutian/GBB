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
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageSearchDto } from './dto/package-search.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  private readonly logger = new Logger(PackagesController.name);

  constructor(private readonly packagesService: PackagesService) {}

  /**
   * 创建套餐
   */
  @Post()
  @ApiOperation({ summary: '创建套餐' })
  @ApiResponse({ status: 201, description: '套餐创建成功' })
  async create(@Body() createPackageDto: CreatePackageDto) {
    this.logger.log(`创建套餐: ${JSON.stringify(createPackageDto)}`);
    return this.packagesService.create(createPackageDto);
  }

  /**
   * 获取所有套餐（支持搜索和分页）
   */
  @Get()
  @ApiOperation({ summary: '获取套餐列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() searchDto: PackageSearchDto) {
    this.logger.log(`查询套餐列表: ${JSON.stringify(searchDto)}`);
    return this.packagesService.findAll(searchDto);
  }

  /**
   * 通过价格区间查找套餐
   */
  @Get('by-price-range')
  @ApiOperation({ summary: '通过价格区间查找套餐' })
  @ApiResponse({ status: 200, description: '查找成功' })
  async findByPriceRange(
    @Query('min_price') minPrice?: number,
    @Query('max_price') maxPrice?: number,
    @Query('sort') sort?: string,
  ) {
    this.logger.log(
      `通过价格区间查找套餐: ${minPrice}-${maxPrice}, 排序: ${sort}`,
    );
    return this.packagesService.findByPriceRange(minPrice, maxPrice, sort);
  }

  /**
   * 通过名称查找套餐
   */
  @Get('by-name')
  @ApiOperation({ summary: '通过名称查找套餐' })
  @ApiResponse({ status: 200, description: '查找成功' })
  async findByName(
    @Query('name') name: string,
    @Query('fuzzy') fuzzy?: string,
  ) {
    this.logger.log(`通过名称查找套餐: ${name}, 模糊搜索: ${fuzzy}`);
    const isFuzzy = fuzzy === 'true';
    return this.packagesService.findByName(name, isFuzzy);
  }

  /**
   * 获取热门套餐
   */
  @Get('popular')
  @ApiOperation({ summary: '获取热门套餐' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPopularPackages(@Query('limit') limit?: number) {
    this.logger.log(`获取热门套餐, 限制: ${limit || 10}`);
    return this.packagesService.getPopularPackages(limit || 10);
  }

  /**
   * 获取套餐详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取套餐详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`获取套餐详情: ${id}`);
    return this.packagesService.findOne(+id);
  }

  /**
   * 更新套餐
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新套餐' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    this.logger.log(
      `更新套餐: ${id}, 数据: ${JSON.stringify(updatePackageDto)}`,
    );
    return this.packagesService.update(+id, updatePackageDto);
  }

  /**
   * 删除套餐
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除套餐' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    this.logger.log(`删除套餐: ${id}`);
    return this.packagesService.remove(+id);
  }

  /**
   * 获取套餐统计信息
   */
  @Get(':id/statistics')
  @ApiOperation({ summary: '获取套餐统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPackageStatistics(@Param('id') id: string) {
    this.logger.log(`获取套餐统计信息: ${id}`);
    return this.packagesService.getPackageStatistics(+id);
  }
}
