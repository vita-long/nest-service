import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheService } from './cache.service';
import redisConfig from './redis.config';

@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule implements OnModuleInit {
  private readonly logger = new Logger(RedisCacheModule.name);

  constructor(private redisCacheService: RedisCacheService) {}

  /**
   * 模块初始化时测试Redis连接
   */
  async onModuleInit() {
    this.logger.log('Initializing RedisCacheModule...');
    try {
      const isConnected = await this.redisCacheService.testConnection();
      if (isConnected) {
        this.logger.log('Redis connection established successfully');
      } else {
        this.logger.warn('Failed to establish Redis connection - cache functionality will be disabled');
      }
    } catch (error) {
      this.logger.warn(`Error during Redis initialization: ${error.message} - cache functionality will be disabled`);
    }
  }
}