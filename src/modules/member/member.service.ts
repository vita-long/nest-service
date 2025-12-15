import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { MemberLevel } from '../../entities/member-level.entity';
import { MemberInfo } from '../../entities/member-info.entity';
import { PointsHistory } from '../../entities/points-history.entity';
import { GrowthValueHistory } from '../../entities/growth-value-history.entity';
import { MemberSubscription } from '../../entities/member-subscription.entity';
import { CreateMemberLevelDto } from './dto/create-member-level.dto';
import { UpdateMemberLevelDto } from './dto/update-member-level.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { AdjustGrowthValueDto } from './dto/adjust-growth-value.dto';

/**
 * 会员服务
 * 处理会员等级、会员信息、积分、成长值和会员订阅的管理
 */
@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberLevel) private memberLevelRepository: Repository<MemberLevel>,
    @InjectRepository(MemberInfo) private memberInfoRepository: Repository<MemberInfo>,
    @InjectRepository(PointsHistory) private pointsHistoryRepository: Repository<PointsHistory>,
    @InjectRepository(GrowthValueHistory) private growthValueHistoryRepository: Repository<GrowthValueHistory>,
    @InjectRepository(MemberSubscription) private memberSubscriptionRepository: Repository<MemberSubscription>,
  ) {}

  /**
   * 创建会员等级
   * @param createMemberLevelDto 创建会员等级的数据
   * @returns 创建的会员等级
   */
  async createMemberLevel(createMemberLevelDto: CreateMemberLevelDto): Promise<MemberLevel> {
    // 检查等级标识是否已存在
    const existingLevel = await this.memberLevelRepository.findOne({
      where: { code: createMemberLevelDto.code },
    });

    if (existingLevel) {
      throw new ConflictException('会员等级标识已存在');
    }

    const memberLevel = this.memberLevelRepository.create({
      name: createMemberLevelDto.name,
      code: createMemberLevelDto.code,
      subscriptionPrice: createMemberLevelDto.subscriptionPrice,
      subscriptionDiscount: createMemberLevelDto.subscriptionDiscount,
      validityPeriod: createMemberLevelDto.validityPeriod,
      discountRate: createMemberLevelDto.discountRate,
      freeShippingTickets: createMemberLevelDto.freeShippingTickets,
      unlimitedFreeShipping: createMemberLevelDto.unlimitedFreeShipping,
      freeBouquetUpgrades: createMemberLevelDto.freeBouquetUpgrades,
      holidayGifts: createMemberLevelDto.holidayGifts,
      description: createMemberLevelDto.description,
      isActive: createMemberLevelDto.isActive,
    });
    return await this.memberLevelRepository.save(memberLevel);
  }

  /**
   * 获取所有会员等级
   * @returns 会员等级列表
   */
  async getAllMemberLevels(): Promise<MemberLevel[]> {
    return await this.memberLevelRepository.find();
  }

  /**
   * 根据ID获取会员等级
   * @param id 会员等级ID
   * @returns 会员等级
   */
  async getMemberLevelById(id: number): Promise<MemberLevel> {
    const memberLevel = await this.memberLevelRepository.findOne({
      where: { id },
    });

    if (!memberLevel) {
      throw new NotFoundException('会员等级不存在');
    }

    return memberLevel;
  }

  /**
   * 更新会员等级
   * @param id 会员等级ID
   * @param updateMemberLevelDto 更新会员等级的数据
   * @returns 更新后的会员等级
   */
  async updateMemberLevel(id: number, updateMemberLevelDto: UpdateMemberLevelDto): Promise<MemberLevel> {
    const memberLevel = await this.getMemberLevelById(id);

    // 如果更新等级标识，检查是否已存在
    if (updateMemberLevelDto.code && updateMemberLevelDto.code !== memberLevel.code) {
      const existingLevel = await this.memberLevelRepository.findOne({
        where: { code: updateMemberLevelDto.code },
      });

      if (existingLevel) {
        throw new ConflictException('会员等级标识已存在');
      }
      memberLevel.code = updateMemberLevelDto.code;
    }

    // 更新其他属性
    if (updateMemberLevelDto.name !== undefined) memberLevel.name = updateMemberLevelDto.name;
    if (updateMemberLevelDto.subscriptionPrice !== undefined) memberLevel.subscriptionPrice = updateMemberLevelDto.subscriptionPrice;
    if (updateMemberLevelDto.subscriptionDiscount !== undefined) memberLevel.subscriptionDiscount = updateMemberLevelDto.subscriptionDiscount;
    if (updateMemberLevelDto.validityPeriod !== undefined) memberLevel.validityPeriod = updateMemberLevelDto.validityPeriod;
    if (updateMemberLevelDto.discountRate !== undefined) memberLevel.discountRate = updateMemberLevelDto.discountRate;
    if (updateMemberLevelDto.freeShippingTickets !== undefined) memberLevel.freeShippingTickets = updateMemberLevelDto.freeShippingTickets;
    if (updateMemberLevelDto.unlimitedFreeShipping !== undefined) memberLevel.unlimitedFreeShipping = updateMemberLevelDto.unlimitedFreeShipping;
    if (updateMemberLevelDto.freeBouquetUpgrades !== undefined) memberLevel.freeBouquetUpgrades = updateMemberLevelDto.freeBouquetUpgrades;
    if (updateMemberLevelDto.holidayGifts !== undefined) memberLevel.holidayGifts = updateMemberLevelDto.holidayGifts;
    if (updateMemberLevelDto.description !== undefined) memberLevel.description = updateMemberLevelDto.description;
    if (updateMemberLevelDto.isActive !== undefined) memberLevel.isActive = updateMemberLevelDto.isActive;

    return await this.memberLevelRepository.save(memberLevel);
  }

  /**
   * 删除会员等级
   * @param id 会员等级ID
   */
  async deleteMemberLevel(id: number): Promise<void> {
    const memberLevel = await this.getMemberLevelById(id);
    await this.memberLevelRepository.remove(memberLevel);
  }

  /**
   * 获取会员信息
   * @param userId 用户ID
   * @returns 会员信息
   */
  async getMemberInfo(userId: string): Promise<MemberInfo> {
    const memberInfo = await this.memberInfoRepository.findOne({
      where: { userId },
      relations: ['currentLevel'],
    });

    if (!memberInfo) {
      throw new NotFoundException('会员信息不存在');
    }

    return memberInfo;
  }

  /**
   * 创建会员信息（用户注册时自动创建）
   * @param userId 用户ID
   * @returns 创建的会员信息
   */
  async createMemberInfo(userId: string): Promise<MemberInfo> {
    // 检查会员信息是否已存在
    const existingMemberInfo = await this.memberInfoRepository.findOne({
      where: { userId },
    });

    if (existingMemberInfo) {
      throw new ConflictException('会员信息已存在');
    }

    // 获取默认会员等级（种子会员）
    const defaultLevel = await this.memberLevelRepository.findOne({
      where: { code: 'seed' },
    });

    if (!defaultLevel) {
      throw new NotFoundException('默认会员等级不存在');
    }

    const memberInfo = this.memberInfoRepository.create({
      userId,
      currentLevelId: defaultLevel.id,
      growthValue: 0,
      points: 0,
      freeShippingTicketsBalance: defaultLevel.freeShippingTickets,
      freeBouquetUpgradesBalance: defaultLevel.freeBouquetUpgrades,
      subscriptionStatus: 'inactive',
    });

    return await this.memberInfoRepository.save(memberInfo);
  }

  /**
   * 调整会员积分
   * @param adjustPointsDto 调整积分的数据
   * @returns 更新后的会员信息
   */
  async adjustPoints(adjustPointsDto: AdjustPointsDto): Promise<MemberInfo> {
    const { userId, amount, type, reason } = adjustPointsDto;
    const memberInfo = await this.getMemberInfo(userId);

    // 计算调整后的积分
    let newPoints;
    if (type === 'increase') {
      newPoints = memberInfo.points + amount;
    } else {
      if (amount > memberInfo.points) {
        throw new ConflictException('积分不足');
      }
      newPoints = memberInfo.points - amount;
    }

    // 更新会员积分
    memberInfo.points = newPoints;

    // 积分有效期逻辑待实现，当前实体中没有pointsExpiredTime字段

    // 创建积分历史记录
    const pointsHistory = this.pointsHistoryRepository.create({
      userId,
      type,
      reason,
      amount,
      previousPoints: memberInfo.points - (type === 'increase' ? amount : -amount),
      currentPoints: newPoints,
    });

    // 保存变更
    await this.memberInfoRepository.save(memberInfo);
    await this.pointsHistoryRepository.save(pointsHistory);

    return memberInfo;
  }

  /**
   * 调整会员成长值
   * @param adjustGrowthValueDto 调整成长值的数据
   * @returns 更新后的会员信息
   */
  async adjustGrowthValue(adjustGrowthValueDto: AdjustGrowthValueDto): Promise<MemberInfo> {
    const { userId, amount, type, reason } = adjustGrowthValueDto;
    const memberInfo = await this.getMemberInfo(userId);

    // 计算调整后的成长值
    let newGrowthValue;
    if (type === 'increase') {
      newGrowthValue = memberInfo.growthValue + amount;
    } else {
      newGrowthValue = Math.max(0, memberInfo.growthValue - amount); // 确保成长值不小于0
    }

    // 更新会员成长值
    memberInfo.growthValue = newGrowthValue;

    // 创建成长值历史记录
    const growthValueHistory = this.growthValueHistoryRepository.create({
      userId,
      type,
      reason,
      amount,
      previousGrowthValue: memberInfo.growthValue - (type === 'increase' ? amount : -amount),
      currentGrowthValue: newGrowthValue,
    });

    // 保存变更
    await this.memberInfoRepository.save(memberInfo);
    await this.growthValueHistoryRepository.save(growthValueHistory);

    // 检查是否需要自动升级会员等级
    await this.checkAndUpgradeMemberLevel(memberInfo);

    return await this.getMemberInfo(userId); // 返回更新后的完整信息
  }

  /**
   * 订阅会员服务
   * @param userId 用户ID
   * @param levelId 会员等级ID
   * @returns 会员订阅信息
   */
  async subscribeMember(userId: string, levelId: number): Promise<MemberSubscription> {
    const memberInfo = await this.getMemberInfo(userId);
    const memberLevel = await this.getMemberLevelById(levelId);

    // 创建订阅信息
    const now = new Date();
    const endTime = new Date(now);
    endTime.setMonth(endTime.getMonth() + memberLevel.validityPeriod);

    const subscription = this.memberSubscriptionRepository.create({
      subscriptionId: uuidv4(),
      userId,
      levelId,
      startTime: now,
      endTime,
      price: memberLevel.subscriptionPrice,
      paymentStatus: 'paid', // 假设立即支付成功
      status: 'active',
      autoRenew: false,
    });

    // 更新会员信息
    memberInfo.currentLevelId = levelId;
    memberInfo.expireTime = endTime;
    memberInfo.freeShippingTicketsBalance = memberLevel.freeShippingTickets;
    memberInfo.freeBouquetUpgradesBalance = memberLevel.freeBouquetUpgrades;
    memberInfo.subscriptionStatus = 'active';

    // 保存变更
    await this.memberSubscriptionRepository.save(subscription);
    await this.memberInfoRepository.save(memberInfo);

    // 增加订阅成长值
    await this.adjustGrowthValue({
      userId,
      amount: memberInfo.currentLevelId === levelId ? 50 : 200, // 首次订阅200点，续订50点
      type: 'increase',
      reason: memberInfo.currentLevelId === levelId ? '会员续订奖励' : '会员订阅奖励',
    });

    return subscription;
  }

  /**
   * 获取积分历史记录
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 积分历史记录列表和总数
   */
  async getPointsHistory(userId: string, page: number = 1, limit: number = 10): Promise<{ data: PointsHistory[]; total: number }> {
    const [data, total] = await this.pointsHistoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  /**
   * 获取成长值历史记录
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 成长值历史记录列表和总数
   */
  async getGrowthValueHistory(userId: string, page: number = 1, limit: number = 10): Promise<{ data: GrowthValueHistory[]; total: number }> {
    const [data, total] = await this.growthValueHistoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  /**
   * 获取会员订阅记录
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 会员订阅记录列表和总数
   */
  async getMemberSubscriptions(userId: string, page: number = 1, limit: number = 10): Promise<{ data: MemberSubscription[]; total: number }> {
    const [data, total] = await this.memberSubscriptionRepository.findAndCount({
      where: { userId },
      relations: ['level'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  /**
   * 检查并升级会员等级
   * @param memberInfo 会员信息
   */
  private async checkAndUpgradeMemberLevel(memberInfo: MemberInfo): Promise<void> {
    // 根据成长值获取可升级的最高等级
    const levels = await this.memberLevelRepository.find({
      where: { isActive: true },
      order: { discountRate: 'ASC' }, // 按折扣率从高到低排序（折扣率越低，等级越高）
    });

    // 找到会员可以升级到的最高等级
    let targetLevel = memberInfo.currentLevel;
    for (const level of levels) {
      // 这里可以根据实际需求设置成长值与等级的对应规则
      // 简单起见，假设等级按折扣率从低到高排列，折扣率越低，等级越高
      if (level.discountRate < targetLevel.discountRate) {
        targetLevel = level;
      }
    }

    // 如果可以升级，更新会员等级
    if (targetLevel.id !== memberInfo.currentLevelId) {
      memberInfo.currentLevelId = targetLevel.id;
      await this.memberInfoRepository.save(memberInfo);
    }
  }
}
