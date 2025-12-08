import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisCacheModule } from '../../common/modules/cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '../../config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule,
    RedisCacheModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}