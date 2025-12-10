import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 获取所有订单（需要认证）
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    // 如果提供了limit和offset，优先使用它们；否则根据page和pageSize计算
    const finalLimit = limit || pageSize;
    const finalOffset = offset !== undefined ? offset : (page - 1) * pageSize;
    
    const result = await this.orderService.findAll(finalLimit, finalOffset);
    
    return {
      list: result.list,
      total: result.total,
      page: page,
      pageSize: pageSize
    };
  }

  // 根据ID获取单个订单
  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('orderId') orderId: string) {
    return this.orderService.findById(orderId);
  }

  // 根据用户ID获取订单列表
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    const finalLimit = limit || pageSize;
    const finalOffset = offset !== undefined ? offset : (page - 1) * pageSize;
    
    const result = await this.orderService.findByUserId(userId, finalLimit, finalOffset);
    
    return {
      list: result.list,
      total: result.total,
      page: page,
      pageSize: pageSize
    };
  }

  // 创建订单（需要认证）
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  // 更新订单（需要认证）
  @Put(':orderId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.orderService.update(orderId, updateOrderDto);
  }

  // 更新订单状态（需要认证）
  @Put(':orderId/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string
  ) {
    return this.orderService.updateStatus(orderId, status);
  }

  // 删除订单（需要认证）
  @Delete(':orderId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('orderId') orderId: string) {
    await this.orderService.remove(orderId);
    return { message: 'Order deleted successfully' };
  }
}
