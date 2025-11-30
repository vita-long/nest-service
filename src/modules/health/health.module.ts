import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisCacheModule } from '@/common/modules/cache/cache.module';

@Module({
  imports: [TerminusModule, RedisCacheModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}