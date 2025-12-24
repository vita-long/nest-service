import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '@/entities/order.entity';
import { OrderItem } from '@/entities/order-item.entity';
import { OrderDiscount } from '@/entities/order-discount.entity';
import { OrderLog } from '@/entities/order-log.entity';
import { Product } from '@/entities/product.entity';
import { Coupon, CouponType } from '@/entities/coupons.entity';
import { CouponReceiveRecord, CouponUseStatus } from '@/entities/coupon_receive_records.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { uuidv7 } from 'uuidv7';
import { ProductService } from '../product/product.service';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderDiscount) private orderDiscountRepository: Repository<OrderDiscount>,
    @InjectRepository(OrderLog) private orderLogRepository: Repository<OrderLog>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponReceiveRecord) private couponReceiveRecordRepository: Repository<CouponReceiveRecord>,
    private productService: ProductService,
    private couponService: CouponService,
    private dataSource: DataSource
  ) {}

  // 不再需要生成自定义订单ID，使用自增ID

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // 使用事务确保数据一致性
    return this.dataSource.transaction(async (manager) => {
      const { userId, products, couponIds, shippingAddress, paymentMethod, remark } = createOrderDto;
      
      // 2. 商品验证和价格计算
      let goodsAmount = 0;
      const validatedProducts: Array<{ 
        product: Product; 
        quantity: number; 
        price: number; 
        subtotalAmount: number 
      }> = [];
      
      for (const productItem of products) {
        const product = await manager.getRepository(Product).findOne({
          where: { id: Number(productItem.productId) },
        });
        
        if (!product) {
          throw new NotFoundException(`商品 ${productItem.productId} 不存在`);
        }
        
        if (!product.isActive) {
          throw new BadRequestException(`商品 ${product.name} 已下架`);
        }
        
        // 验证库存
        if (product.stock < productItem.quantity) {
          throw new BadRequestException(`商品 ${product.name} 库存不足，当前库存: ${product.stock}`);
        }
        validatedProducts.push({
          product,
          quantity: productItem.quantity,
          price: productItem.price, // 使用当前价格（快照）
          subtotalAmount: productItem.price * productItem.quantity
        });
        
        goodsAmount += productItem.price * productItem.quantity;
      }
      
      // 3. 优惠券验证和优惠金额计算
      let discountAmount = 0;
      const validatedCoupons: Array<{ couponRecord: CouponReceiveRecord; coupon: Coupon; discountAmount: number }> = [];
      
      if (couponIds && couponIds.length > 0) {
        for (const couponId of couponIds) {
          // 查询用户领取的优惠券记录
          const couponRecord = await manager.getRepository(CouponReceiveRecord).findOne({
            where: {
              id: couponId,
              userId: userId,
              status: CouponUseStatus.UNUSED
            },
            relations: ['coupon']
          });
          
          if (!couponRecord) {
            throw new NotFoundException(`优惠券 ${couponId} 不存在或已使用`);
          }
          
          const coupon = couponRecord.coupon;
          
          // 验证优惠券是否过期
          const now = new Date();
          if (now < coupon.startTime || now > coupon.endTime) {
            throw new BadRequestException(`优惠券 ${coupon.name} 已过期`);
          }
          
          // 验证优惠券是否激活
          if (coupon.status !== 'active') {
            throw new BadRequestException(`优惠券 ${coupon.name} 已失效`);
          }
          
          // 验证优惠券适用范围
          if (coupon.productScope && coupon.productScope.length > 0) {
            const validProducts = validatedProducts.filter(p => 
              coupon.productScope!.includes(p.product.id.toString())
            );
            
            if (validProducts.length === 0) {
              throw new BadRequestException(`优惠券 ${coupon.name} 不适用于当前订单商品`);
            }
          }
          
          // 计算优惠金额
          let couponDiscount = 0;
          if (coupon.type === CouponType.DISCOUNT) {
            // 折扣券
            couponDiscount = goodsAmount * (1 - (coupon.discount || 0));
          } else if (coupon.type === CouponType.FULL_REDUCTION) {
            // 固定金额券
            couponDiscount = Math.min(coupon.value || 0, goodsAmount);
          } else if (coupon.type === CouponType.SHIPPING_FREE) {
            // 免运费券（这里假设运费为0，实际项目中可能需要调整）
            couponDiscount = 0;
          }
          
          validatedCoupons.push({
            couponRecord,
            coupon,
            discountAmount: couponDiscount
          });
          
          discountAmount += couponDiscount;
        }
      }
      
      // 4. 计算订单总金额
      const totalAmount = Math.max(0, goodsAmount - discountAmount);
      
      // 5. 生成订单
      const order = manager.getRepository(Order).create({
        userId: userId,
        goodsAmount: goodsAmount,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod || 'online',
        status: 'pending',
        shippingAddress: shippingAddress,
        remark: remark
      });
      
      const savedOrder = await manager.getRepository(Order).save(order);
      
      // 6. 保存商品明细
      const orderItems = validatedProducts.map(productItem => {
        const orderItem = manager.getRepository(OrderItem).create({
          orderId: savedOrder.id,
          productId: productItem.product.id,
          productName: productItem.product.name,
          unitPrice: productItem.price,
          quantity: productItem.quantity,
          subtotalAmount: productItem.subtotalAmount,
          productImage: productItem.product.mainImage
        });
        return orderItem;
      });
      
      await manager.getRepository(OrderItem).save(orderItems);
      
      // 7. 保存优惠信息明细
      const orderDiscounts = validatedCoupons.map(couponInfo => {
        const orderDiscount = manager.getRepository(OrderDiscount).create({
          orderId: savedOrder.id,
          couponId: couponInfo.coupon.id,
          couponCode: couponInfo.coupon.code,
          discountAmount: couponInfo.discountAmount
        });
        return orderDiscount;
      });
      
      await manager.getRepository(OrderDiscount).save(orderDiscounts);
      
      // 8. 更新优惠券使用状态
      for (const couponInfo of validatedCoupons) {
        await manager.getRepository(CouponReceiveRecord).update(
          couponInfo.couponRecord.id,
          { 
            status: CouponUseStatus.USED, 
            usedTime: new Date(), 
            orderId: savedOrder.id 
          }
        );
      }
      
      // 9. 库存预扣
      for (const productItem of validatedProducts) {
        await this.productService.updateStock(
          productItem.product.id,
          -productItem.quantity,
          'sale',
          userId.toString(),
          `订单 ${savedOrder.id} 预扣库存`
        );
      }
      
      // 10. 记录订单日志
      const orderLog = manager.getRepository(OrderLog).create({
        orderId: savedOrder.id,
        operator: userId.toString(),
        operationType: 'create',
        operationContent: `用户 ${userId} 创建了订单 ${savedOrder.id}`,
        statusChange: {
          from: '',
          to: 'pending'
        }
      });
      
      await manager.getRepository(OrderLog).save(orderLog);
      
      return savedOrder;
    });
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
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.orderDiscounts', 'orderDiscounts')
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list: items, total: totalCount };
  }

  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderDiscounts', 'orderLogs']
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByUserId(userId: number, limit?: number, offset?: number): Promise<{ list: Order[], total: number }> {
    const query = this.orderRepository.createQueryBuilder('order')
      .where('order.userId = :userId', { userId });
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    const [items, totalCount] = await query
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.orderDiscounts', 'orderDiscounts')
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list: items, total: totalCount };
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    // 检查订单是否存在
    await this.findById(id);

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

    await this.orderRepository.update({ id }, updateOrderDto);
    return this.findById(id);
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    // 检查订单是否存在
    const order = await this.findById(id);

    // 验证状态值是否有效
    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    // 记录原状态用于日志
    const oldStatus = order.status;
    
    // 如果状态没有变化，不执行更新
    if (oldStatus === status) {
      return order;
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

    await this.orderRepository.update({ id }, updateData);
    
    // 记录订单状态变更日志
    const orderLog = this.orderLogRepository.create({
      orderId: id,
      operator: 'system', // 如果有用户操作，这里应该是用户ID
      operationType: 'status_change',
      operationContent: `订单状态从 ${oldStatus} 变更为 ${status}`,
      statusChange: {
        from: oldStatus,
        to: status
      }
    });
    await this.orderLogRepository.save(orderLog);
    
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    // 检查订单是否存在
    await this.findById(id);
    
    const result = await this.orderRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
