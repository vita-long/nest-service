import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule } from '@/common/modules/cache/cache.module';

import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberLevelSeed } from './seed/member-level.seed';
import { SeedMemberLevelsCommand } from './commands/seed-member-levels.command';
import { MemberLevel } from '../../entities/member-level.entity';
import { MemberInfo } from '../../entities/member-info.entity';
import { PointsHistory } from '../../entities/points-history.entity';
import { MemberSubscription } from '../../entities/member-subscription.entity';

/**
 * 会员模块
 * 包含会员等级、会员信息、积分和成长值管理的所有组件
 */
@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([
      MemberLevel,
      MemberInfo,
      PointsHistory,
      MemberSubscription
    ]),
  ],
  controllers: [MemberController],
  providers: [MemberService, MemberLevelSeed, SeedMemberLevelsCommand],
  exports: [MemberService], // 导出服务，以便其他模块可以使用
})
export class MemberModule {}
