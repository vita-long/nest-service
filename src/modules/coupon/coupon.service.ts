import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Coupon, CouponStatus, CouponType } from '../../entities/coupons.entity';
import { CouponReceiveRecord, CouponUseStatus } from '../../entities/coupon_receive_records.entity';
import { CreateCouponDto, FindCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { IssueCouponDto } from './dto/issue-coupon.dto';
import { nanoid } from 'nanoid';

/**
 * 优惠券服务类
 * 实现优惠券的所有业务逻辑
 */
@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponReceiveRecord) private couponReceiveRecordRepository: Repository<CouponReceiveRecord>
  ) {}

  /**
   * 生成优惠券码
   * @returns 生成的优惠券码
   */
  generateCouponCode(): string {
    return nanoid(8);
  }

  /**
   * 创建优惠券
   * @param createCouponDto 创建优惠券的数据传输对象
   * @returns 创建的优惠券对象
   */
  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    let couponCode = createCouponDto.code;
    
    // 如果没有提供优惠券码，则自动生成
    if (!couponCode) {
      let isUnique = false;
      let generatedCode: string;
      
      // 生成唯一的优惠券码
      while (!isUnique) {
        generatedCode = this.generateCouponCode();
        const existingCoupon = await this.couponRepository.findOneBy({ code: generatedCode });
        if (!existingCoupon) {
          couponCode = generatedCode;
          isUnique = true;
        }
      }
    } else {
      // 如果提供了优惠券码，验证是否已存在
      const existingCoupon = await this.couponRepository.findOneBy({ code: couponCode });
      if (existingCoupon) {
        throw new BadRequestException(`优惠券码 ${couponCode} 已存在`);
      }
    }

    // 验证生效时间是否早于过期时间
    if (createCouponDto.startTime > createCouponDto.endTime) {
      throw new BadRequestException('生效时间必须早于过期时间');
    }

    // 创建优惠券对象
    const coupon = this.couponRepository.create({
      ...createCouponDto,
      code: couponCode,
      remainingQuantity: createCouponDto.totalQuantity,
      status: CouponStatus.ACTIVE
    });

    return this.couponRepository.save(coupon);
  }

  /**
   * 查询所有优惠券（带分页）
   * @param limit 每页数量
   * @param offset 偏移量
   * @param status 优惠券状态
   * @param type 优惠券类型
   * @returns 优惠券列表和总数
   */
  async findAll(findCouponDto: FindCouponDto): Promise<{ list: Coupon[], total: number }> {
    const { limit, offset, status, type, name, code } = findCouponDto;

    const query = this.couponRepository.createQueryBuilder('coupon');

    // 默认过滤掉已删除的优惠券
    query.where('coupon.status != :deleted', { deleted: CouponStatus.DELETED });

    // 添加状态过滤
    if (status) {
      query.andWhere('coupon.status = :status', { status });
    }

    // 添加类型过滤
    if (type) {
      query.andWhere('coupon.type = :type', { type });
    }

    if (code) {
      query.andWhere('coupon.code = :code', { code });
    }

    if (name) {
      query.andWhere('coupon.name LIKE :name', { name: `%${name}%` });
    }

    // 添加分页
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }

    // 执行查询
    const [items, totalCount] = await query.orderBy('coupon.createdAt', 'DESC').getManyAndCount();

    return { list: items, total: totalCount };
  }

  /**
   * 根据ID查询优惠券
   * @param id 优惠券ID
   * @returns 优惠券对象
   */
  async findById(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOneBy({ id, status: Not(CouponStatus.DELETED) });
    if (!coupon) {
      throw new NotFoundException(`ID为 ${id} 的优惠券不存在`);
    }
    return coupon;
  }

  /**
   * 根据优惠券码查询优惠券
   * @param code 优惠券码
   * @returns 优惠券对象
   */
  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOneBy({ code, status: Not(CouponStatus.DELETED) });
    if (!coupon) {
      throw new NotFoundException(`优惠券码 ${code} 不存在`);
    }
    return coupon;
  }

  /**
   * 更新优惠券
   * @param id 优惠券ID
   * @param updateCouponDto 更新优惠券的数据传输对象
   * @returns 更新后的优惠券对象
   */
  async update(id: number, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    // 验证优惠券是否存在
    const coupon = await this.findById(id);

    // 验证生效时间是否早于过期时间
    if (updateCouponDto.startTime && updateCouponDto.endTime) {
      if (updateCouponDto.startTime > updateCouponDto.endTime) {
        throw new BadRequestException('生效时间必须早于过期时间');
      }
    } else if (updateCouponDto.startTime && updateCouponDto.startTime > coupon.endTime) {
      throw new BadRequestException('生效时间必须早于当前过期时间');
    } else if (updateCouponDto.endTime && updateCouponDto.endTime < coupon.startTime) {
      throw new BadRequestException('过期时间必须晚于当前生效时间');
    }

    // 验证剩余数量是否大于等于0且不超过总数量
    if (updateCouponDto.remainingQuantity !== undefined) {
      const totalQuantity = updateCouponDto.totalQuantity !== undefined ? updateCouponDto.totalQuantity : coupon.totalQuantity;
      if (updateCouponDto.remainingQuantity < 0) {
        throw new BadRequestException('剩余数量不能为负数');
      }
      if (updateCouponDto.remainingQuantity > totalQuantity) {
        throw new BadRequestException('剩余数量不能超过总数量');
      }
    }

    // 验证总数量是否大于等于剩余数量
    if (updateCouponDto.totalQuantity !== undefined) {
      const remainingQuantity = updateCouponDto.remainingQuantity !== undefined ? updateCouponDto.remainingQuantity : coupon.remainingQuantity;
      if (updateCouponDto.totalQuantity < remainingQuantity) {
        throw new BadRequestException('总数量不能小于剩余数量');
      }
    }

    // 更新优惠券
    await this.couponRepository.update(id, updateCouponDto);

    return this.findById(id);
  }

  /**
   * 删除优惠券
   * @param id 优惠券ID
   */
  async remove(id: number): Promise<void> {
    // 验证优惠券是否存在
    await this.findById(id);

    // 更新优惠券状态为已删除
    await this.couponRepository.update(id, { status: CouponStatus.DELETED });
  }

  /**
   * 发放优惠券
   * @param issueCouponDto 发放优惠券的数据传输对象
   * @returns 发放结果
   */
  async issueCoupon(issueCouponDto: IssueCouponDto): Promise<{ success: boolean; message: string }> {
    // 验证优惠券是否存在
    const coupon = await this.findById(issueCouponDto.couponId);

    // 验证优惠券状态
    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException('优惠券未激活');
    }

    // 验证优惠券是否在有效期内
    const now = new Date();
    if (now < coupon.startTime || now > coupon.endTime) {
      throw new BadRequestException('优惠券不在有效期内');
    }

    // 验证剩余数量是否足够
    if (coupon.remainingQuantity < issueCouponDto.quantity) {
      throw new BadRequestException('优惠券数量不足');
    }

    // 创建优惠券领取记录
    const receiveRecords: CouponReceiveRecord[] = [];
    const nowDate = new Date();
    
    for (let i = 0; i < issueCouponDto.quantity; i++) {
      // 为每个领取的优惠券生成记录
      const receiveRecord = this.couponReceiveRecordRepository.create({
        userId: parseInt(issueCouponDto.userId, 10), // 将string类型的userId转换为number
        couponId: coupon.id,
        couponCode: coupon.code,
        receiveTime: nowDate,
        status: CouponUseStatus.UNUSED
      });
      receiveRecords.push(receiveRecord);
    }

    // 保存领取记录
    await this.couponReceiveRecordRepository.save(receiveRecords);

    // 更新优惠券剩余数量
    await this.couponRepository.update(issueCouponDto.couponId, {
      remainingQuantity: coupon.remainingQuantity - issueCouponDto.quantity
    });

    return { success: true, message: '优惠券发放成功' };
  }

  /**
   * 查询用户领取的优惠券
   * @param userId 用户ID
   * @param status 优惠券使用状态（可选）
   * @returns 用户领取的优惠券列表
   */
  async findUserCoupons(userId: number, status?: CouponUseStatus): Promise<CouponReceiveRecord[]> {
    const query = this.couponReceiveRecordRepository.createQueryBuilder('record');

    // 关联查询优惠券信息
    query.leftJoinAndSelect('record.coupon', 'coupon');
    // 根据用户ID过滤
    query.where('record.userId = :userId', { userId });

    // 根据使用状态过滤（可选）
    if (status) {
      query.andWhere('record.status = :status', { status });
    }

    // 按领取时间倒序排列
    query.orderBy('record.receiveTime', 'DESC');

    return query.getMany();
  }

  /**
   * 检查优惠券是否可用
   * @param code 优惠券码
   * @returns 优惠券对象
   */
  async checkCoupon(code: string): Promise<Coupon> {
    const coupon = await this.findByCode(code);

    // 验证优惠券状态
    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException('优惠券未激活');
    }

    // 验证优惠券是否在有效期内
    const now = new Date();
    if (now < coupon.startTime || now > coupon.endTime) {
      throw new BadRequestException('优惠券不在有效期内');
    }

    // 验证优惠券是否还有剩余数量
    if (coupon.remainingQuantity <= 0) {
      throw new BadRequestException('优惠券已领完');
    }

    return coupon;
  }
}
