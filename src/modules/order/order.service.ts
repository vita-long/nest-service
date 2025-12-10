import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class OrderService {
  constructor(@InjectRepository(Order) private orderRepository: Repository<Order>) {}

  // 生成自定义订单ID
  private generateOrderId(): string {
    const machineId = process.env.MACHINE_ID || '0';
    const timestamp = Date.now();
    const randomId = uuidv7();
    return `${machineId}ord_${timestamp}_${randomId}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      orderId: this.generateOrderId(),
      status: 'pending', // 默认订单状态为待支付
    });
    return this.orderRepository.save(order);
  }

  async findAll(limit?: number, offset?: number): Promise<{ list: Order[], total: number }> {
    const query = this.orderRepository.createQueryBuilder('order');
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    const [items, totalCount] = await query
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list: items, total: totalCount };
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ orderId });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  async findByUserId(userId: string, limit?: number, offset?: number): Promise<{ list: Order[], total: number }> {
    const query = this.orderRepository.createQueryBuilder('order')
      .where('order.userId = :userId', { userId });
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    const [items, totalCount] = await query
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list: items, total: totalCount };
  }

  async update(orderId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    // 检查订单是否存在
    await this.findById(orderId);

    // 如果更新订单状态为已支付，设置支付时间
    if (updateOrderDto.status === 'paid' && !updateOrderDto.paymentTime) {
      updateOrderDto.paymentTime = new Date();
    }

    // 如果更新订单状态为已发货，设置发货时间
    if (updateOrderDto.status === 'shipped' && !updateOrderDto.shippingTime) {
      updateOrderDto.shippingTime = new Date();
    }

    // 如果更新订单状态为已完成，设置完成时间
    if (updateOrderDto.status === 'completed' && !updateOrderDto.completedTime) {
      updateOrderDto.completedTime = new Date();
    }

    await this.orderRepository.update({ orderId }, updateOrderDto);
    return this.findById(orderId);
  }

  async updateStatus(orderId: string, status: string): Promise<Order> {
    // 检查订单是否存在
    const order = await this.findById(orderId);

    // 验证状态值是否有效
    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    // 更新订单状态
    const updateData: any = { status };

    // 根据状态设置相应的时间
    if (status === 'paid') {
      updateData.paymentTime = new Date();
    } else if (status === 'shipped') {
      updateData.shippingTime = new Date();
    } else if (status === 'completed') {
      updateData.completedTime = new Date();
    }

    await this.orderRepository.update({ orderId }, updateData);
    return this.findById(orderId);
  }

  async remove(orderId: string): Promise<void> {
    // 检查订单是否存在
    await this.findById(orderId);
    
    const result = await this.orderRepository.delete({ orderId });
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
  }
}
