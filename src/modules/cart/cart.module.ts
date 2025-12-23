import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../../entities/cart.entity';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { RedisCacheModule } from '../../common/modules/cache/cache.module';

/**
 * 购物车模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Cart, User, Product]), RedisCacheModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
