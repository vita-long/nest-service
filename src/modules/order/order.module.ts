import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@/entities/order.entity';
import { OrderItem } from '@/entities/order-item.entity';
import { OrderDiscount } from '@/entities/order-discount.entity';
import { OrderLog } from '@/entities/order-log.entity';
import { Product } from '@/entities/product.entity';
import { Coupon } from '@/entities/coupons.entity';
import { CouponReceiveRecord } from '@/entities/coupon_receive_records.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '@/common/modules/cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '../../config';
import { ProductModule } from '../product/product.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderDiscount, OrderLog, Product, Coupon, CouponReceiveRecord]),
    AuthModule, // 导入AuthModule以获取JwtService
    RedisCacheModule, // 导入RedisCacheModule以获取RedisCacheService
    ConfigModule.forFeature(jwtConfig), // 导入JWT配置
    ProductModule, // 导入ProductModule以获取ProductService
    CouponModule, // 导入CouponModule以获取CouponService
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
