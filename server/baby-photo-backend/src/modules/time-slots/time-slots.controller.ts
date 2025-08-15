import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TimeSlotsService } from './time-slots.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { QueryTimeSlotsDto } from './dto/query-time-slots.dto';
import { CreateBatchTimeSlotsDto } from './dto/create-batch-time-slots.dto';

@ApiTags('时间槽管理')
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Post()
  @ApiOperation({ summary: '创建单个时间槽' })
  @ApiResponse({ status: 201, description: '时间槽创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '时间槽已存在' })
  create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotsService.create(createTimeSlotDto);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建时间槽' })
  @ApiResponse({ status: 201, description: '批量时间槽创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  createBatch(@Body() createBatchDto: CreateBatchTimeSlotsDto) {
    return this.timeSlotsService.createBatch(createBatchDto);
  }

  @Get()
  @ApiOperation({ summary: '获取时间槽列表' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'isBooked', required: false, description: '是否已预订' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '排序方式',
    enum: ['date_asc', 'date_desc', 'time_asc', 'time_desc'],
  })
  @ApiResponse({ status: 200, description: '成功获取时间槽列表' })
  findAll(@Query() query: QueryTimeSlotsDto) {
    return this.timeSlotsService.findAll(query);
  }

  @Get('available')
  @ApiOperation({ summary: '获取可用时间槽' })
  @ApiQuery({ name: 'date', required: false, description: '指定日期（可选）' })
  @ApiResponse({ status: 200, description: '成功获取可用时间槽' })
  findAvailable(@Query('date') date?: string) {
    return this.timeSlotsService.findAvailable(date);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取时间槽详情' })
  @ApiParam({ name: 'id', description: '时间槽ID' })
  @ApiResponse({ status: 200, description: '成功获取时间槽详情' })
  @ApiResponse({ status: 404, description: '时间槽不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.timeSlotsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新时间槽' })
  @ApiParam({ name: 'id', description: '时间槽ID' })
  @ApiResponse({ status: 200, description: '时间槽更新成功' })
  @ApiResponse({ status: 404, description: '时间槽不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
  ) {
    return this.timeSlotsService.update(id, updateTimeSlotDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除时间槽' })
  @ApiParam({ name: 'id', description: '时间槽ID' })
  @ApiResponse({ status: 200, description: '时间槽删除成功' })
  @ApiResponse({ status: 404, description: '时间槽不存在' })
  @ApiResponse({ status: 400, description: '无法删除有订单的时间槽' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.timeSlotsService.remove(id);
  }
}
