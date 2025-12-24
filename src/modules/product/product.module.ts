import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { StockHistory } from '../../entities/stock-history.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../category/category.module';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../../common/modules/cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '../../config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, StockHistory]),
    CategoryModule,
    AuthModule, // 导入AuthModule以获取JwtService
    RedisCacheModule, // 导入RedisCacheModule以获取RedisCacheService
    ConfigModule.forFeature(jwtConfig), // 导入JWT配置
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
