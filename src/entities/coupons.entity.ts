import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 优惠券类型枚举
 */
export enum CouponType {
  FULL_REDUCTION = 'full_reduction', // 满减券
  DISCOUNT = 'discount', // 折扣券
  SHIPPING_FREE = 'shipping_free', // 免运费券
  FIXED_AMOUNT = 'fixed_amount', // 固定金额券
}

/**
 * 优惠券发放渠道枚举
 */
export enum CouponSource {
  SYSTEM_AUTO = 'system_auto', // 系统自动发放（生日、注册）
  ACTIVITY_DRAW = 'activity_draw', // 活动抽奖
  ADMIN_CREATE = 'admin_create', // 后台手动发放
  SHARE_INVITE = 'share_invite', // 分享邀请获得
  ORDER_REWARD = 'order_reward', // 下单返券
}

/**
 * 优惠券状态枚举
 */
export enum CouponStatus {
  ACTIVE = 'active', // 激活
  INACTIVE = 'inactive', // 未激活
  EXPIRED = 'expired', // 已过期
  DELETED = 'deleted', // 已删除
}

/**
 * 优惠券实体类
 * 用于存储优惠券信息
 */
@Entity({ name: 'coupons' })
export class Coupon {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 券码
   * 优惠券的唯一标识
   */
  @Column({
    name: 'code',
    unique: true,
    nullable: false,
    length: 50,
    comment: '券码',
  })
  code: string;

  /**
   * 券名
   * 优惠券的显示名称
   */
  @Column({ name: 'name', nullable: false, length: 255, comment: '券名' })
  name: string;

  /**
   * 优惠券类型
   * 折扣券、免运费券、生日礼品券等
   */
  @Column({
    name: 'type',
    type: 'enum',
    enum: CouponType,
    nullable: false,
    comment: '优惠券类型',
  })
  type: CouponType;

  /**
   * 面值
   * 优惠券的价值，根据类型不同有不同含义
   */
  @Column({
    name: 'value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '面值',
  })
  value?: number;

  /**
   * 折扣
   * 优惠券的折扣
   * 选择折扣劵时生效，例如9.5折对应的折扣为0.95
   */
  @Column({
    name: 'discount',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '折扣',
  })
  discount?: number;

  /**
   * 生效时间
   * 优惠券开始生效的时间
   */
  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: false,
    comment: '生效时间',
  })
  startTime: Date;

  /**
   * 过期时间
   * 优惠券失效的时间
   */
  @Column({
    name: 'end_time',
    type: 'datetime',
    nullable: false,
    comment: '过期时间',
  })
  endTime: Date;

  /**
   * 适用商品范围
   * 优惠券适用的商品ID列表，为空表示全部商品
   */
  @Column({
    name: 'product_scope',
    type: 'json',
    nullable: true,
    comment: '适用商品范围',
  })
  productScope?: string[];

  /**
   * 发放时机
   * 优惠券发放的条件或时机
   */
  @Column({
    name: 'issue_condition',
    type: 'json',
    nullable: true,
    comment: '发放时机',
  })
  issueCondition?: any;

  /**
   * 额外属性
   * 优惠券的其他属性
   */
  @Column({
    name: 'extra_properties',
    type: 'json',
    nullable: true,
    comment: '额外属性',
  })
  extraProperties?: any;

  /**
   * 剩余数量
   * 优惠券的剩余可领取数量
   */
  @Column({
    name: 'remaining_quantity',
    type: 'int',
    default: 0,
    comment: '剩余数量',
  })
  remainingQuantity: number;

  /**
   * 总数量
   * 优惠券的总发行数量
   */
  @Column({
    name: 'total_quantity',
    type: 'int',
    default: 0,
    comment: '总数量',
  })
  totalQuantity: number;

  /**
   * 优惠券状态
   * 激活、未激活、已过期、已删除等
   */
  @Column({
    name: 'status',
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
    comment: '优惠券状态',
  })
  status: CouponStatus;

  /**
   * 发放渠道
   * 优惠券的发放来源
   */
  @Column({
    name: 'source',
    type: 'enum',
    enum: CouponSource,
    nullable: false,
    comment: '发放渠道',
  })
  source: CouponSource;

  /**
   * 创建时间
   * 优惠券创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 优惠券最后更新的时间
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  /**
   * 优惠券描述
   * 优惠券的详细说明
   */
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    comment: '优惠券描述',
  })
  description?: string;
}
