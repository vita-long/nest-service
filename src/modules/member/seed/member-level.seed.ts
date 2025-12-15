import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberLevel } from '../../../entities/member-level.entity';
import { MemberLevelConstants } from '../../../common/constants';

/**
 * 会员等级种子数据服务
 * 用于初始化系统默认的会员等级
 */
@Injectable()
export class MemberLevelSeed {
  constructor(
    @InjectRepository(MemberLevel) private readonly memberLevelRepository: Repository<MemberLevel>,
  ) {}

  /**
   * 初始化会员等级数据
   */
  async seed() {
    // 检查是否已存在会员等级数据
    const existingLevels = await this.memberLevelRepository.find();
    if (existingLevels.length > 0) {
      console.log('会员等级数据已存在，跳过初始化');
      return;
    }

    // 会员等级初始数据
    const memberLevels = [
      {
        name: '青铜会员',
        code: MemberLevelConstants.BRONZE,
        subscriptionPrice: 0,
        subscriptionDiscount: 1.0,
        validityPeriod: 0,
        discountRate: 0.98,
        freeShippingTickets: 1,
        unlimitedFreeShipping: false,
        freeBouquetUpgrades: 0,
        holidayGifts: false,
        description: '青铜会员，享受基本会员权益',
        isActive: true,
      },
      {
        name: '白银会员',
        code: MemberLevelConstants.SILVER,
        subscriptionPrice: 99,
        subscriptionDiscount: 0.9,
        validityPeriod: 12,
        discountRate: 0.95,
        freeShippingTickets: 3,
        unlimitedFreeShipping: false,
        freeBouquetUpgrades: 1,
        holidayGifts: false,
        description: '白银会员，享受更多会员权益',
        isActive: true,
      },
      {
        name: '黄金会员',
        code: MemberLevelConstants.GOLD,
        subscriptionPrice: 199,
        subscriptionDiscount: 0.8,
        validityPeriod: 12,
        discountRate: 0.9,
        freeShippingTickets: 5,
        unlimitedFreeShipping: true,
        freeBouquetUpgrades: 2,
        holidayGifts: true,
        description: '黄金会员，享受高级会员权益',
        isActive: true,
      },
      {
        name: '钻石会员',
        code: MemberLevelConstants.DIAMOND,
        subscriptionPrice: 399,
        subscriptionDiscount: 0.7,
        validityPeriod: 12,
        discountRate: 0.85,
        freeShippingTickets: 10,
        unlimitedFreeShipping: true,
        freeBouquetUpgrades: 5,
        holidayGifts: true,
        description: '钻石会员，享受顶级会员权益',
        isActive: true,
      },
    ];

    // 创建会员等级
    for (const level of memberLevels) {
      await this.memberLevelRepository.save(level);
    }

    console.log('会员等级数据初始化完成');
  }
}
