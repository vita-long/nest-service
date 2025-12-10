import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@/entities/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '@/common/modules/cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '../../config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    AuthModule, // 导入AuthModule以获取JwtService
    RedisCacheModule, // 导入RedisCacheModule以获取RedisCacheService
    ConfigModule.forFeature(jwtConfig), // 导入JWT配置
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
