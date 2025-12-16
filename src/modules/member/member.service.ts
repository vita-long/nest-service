import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { MemberLevel } from '../../entities/member-level.entity';
import { MemberInfo } from '../../entities/member-info.entity';
import { PointsHistory } from '../../entities/points-history.entity';
import { MemberSubscription } from '../../entities/member-subscription.entity';
import { CreateMemberLevelDto } from './dto/create-member-level.dto';
import { UpdateMemberLevelDto } from './dto/update-member-level.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { ActivateMemberDto } from './dto/activate-member.dto';

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
   * 获取所有会员信息（分页）
   * @param page 页码
   * @param limit 每页数量
   * @returns 会员信息列表和总数
   */
  async getMemberInfo(page: number = 1, limit: number = 10): Promise<{ list: MemberInfo[]; total: number }> {
    const [data, total] = await this.memberInfoRepository.findAndCount({
      relations: ['currentLevel'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    console.log(data);
    return { list: data, total };
  }

  /**
   * 根据用户ID获取单个会员信息
   * @param userId 用户ID
   * @returns 会员信息
   */
  async getMemberInfoById(userId: string): Promise<MemberInfo> {
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

    // 获取默认会员等级
    const defaultLevel = await this.memberLevelRepository.findOne({
      where: { code: 'bronze' },
    });

    if (!defaultLevel) {
      throw new NotFoundException('默认会员等级不存在');
    }

    const memberInfo = this.memberInfoRepository.create({
      userId,
      currentLevelId: defaultLevel.id,
      points: 200,
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
    const memberInfo = await this.getMemberInfoById(userId);

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
   * 订阅会员服务
   * @param userId 用户ID
   * @param levelId 会员等级ID
   * @returns 会员订阅信息
   */
  async subscribeMember(userId: string, levelId: number): Promise<MemberSubscription> {
    const memberInfo = await this.getMemberInfoById(userId);
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
   * 调整会员状态
   * @param activateMemberDto 调整会员状态的数据
   * @returns 更新后的会员信息
   */
  async activateMember(activateMemberDto: ActivateMemberDto): Promise<MemberInfo> {
    const { userId, active } = activateMemberDto;
    const memberInfo = await this.getMemberInfoById(userId);

    // 更新会员状态
    memberInfo.subscriptionStatus = active;

    // 如果是激活状态，确保有默认会员等级
    if (active === 'active' && !memberInfo.currentLevelId) {
      const defaultLevel = await this.memberLevelRepository.findOne({
        where: { code: 'bronze' },
      });

      if (defaultLevel) {
        memberInfo.currentLevelId = defaultLevel.id;
      }
    }

    // 保存变更
    await this.memberInfoRepository.save(memberInfo);

    return await this.getMemberInfoById(userId); // 返回更新后的完整信息
  }


}
