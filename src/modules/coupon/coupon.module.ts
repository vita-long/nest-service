import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from '../../entities/coupons.entity';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { RedisCacheModule } from '../../common/modules/cache/cache.module';

/**
 * 优惠券模块配置类
 * 注册优惠券相关的实体、服务和控制器
 */
@Module({
  imports: [TypeOrmModule.forFeature([Coupon]), RedisCacheModule],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService]
})
export class CouponModule {}
