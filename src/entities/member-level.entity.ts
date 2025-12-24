import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 会员等级实体类
 * 用于存储不同等级会员的基本信息和权益配置
 */
@Entity('member_levels')
export class MemberLevel {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 等级名称
   */
  @Column({
    name: 'name',
    nullable: false,
    unique: true,
    length: 50,
    comment: '等级名称',
  })
  name: string;

  /**
   * 等级标识
   */
  @Column({
    name: 'code',
    nullable: false,
    unique: true,
    length: 50,
    comment: '等级code',
  })
  code: string;

  /**
   * 订阅价格
   * 该等级会员的订阅价格，种子会员为0
   */
  @Column({
    name: 'subscription_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '订阅价格',
  })
  subscriptionPrice: number;

  /**
   * 有效期
   * 订阅后的有效期，单位为月，0表示永久有效
   */
  @Column({
    name: 'validity_period',
    type: 'int',
    default: 0,
    comment: '有效期(月)',
  })
  validityPeriod: number;

  /**
   * 折扣
   * 该等级会员享受的折扣，如0.95表示9.5折
   */
  @Column({
    name: 'discount_rate',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 1.0,
    comment: '折扣',
  })
  discountRate: number;

  /**
   * 免运费券数量
   * 每月可领取的免运费券数量
   */
  @Column({
    name: 'free_shipping_tickets',
    type: 'int',
    default: 0,
    comment: '每月免运费券数量',
  })
  freeShippingTickets: number;

  /**
   * 无限免运费
   * 是否享受全年无限次免运费
   */
  @Column({
    name: 'unlimited_free_shipping',
    default: false,
    comment: '全年无限次免运费',
  })
  unlimitedFreeShipping: boolean;

  /**
   * 免费花束升级次数
   * 每月可享受的免费花束升级次数
   */
  @Column({
    name: 'free_bouquet_upgrades',
    type: 'int',
    default: 0,
    comment: '每月免费花束升级次数',
  })
  freeBouquetUpgrades: number;

  /**
   * 节日礼品
   * 是否在重大节日赠送神秘高阶花礼
   */
  @Column({
    name: 'holiday_gifts',
    default: false,
    comment: '重大节日赠送神秘高阶花礼',
  })
  holidayGifts: boolean;

  /**
   * 订阅折扣
   * 订阅服务时享受的折扣
   */
  @Column({
    name: 'subscription_discount',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 1.0,
    comment: '订阅折扣',
  })
  subscriptionDiscount: number;

  /**
   * 描述
   * 会员等级的详细描述
   */
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    comment: '等级描述',
  })
  description?: string;

  /**
   * 状态
   * 等级是否启用
   */
  @Column({ name: 'is_active', default: true, comment: '是否启用' })
  isActive: boolean;

  /**
   * 创建时间
   * 记录等级创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录等级信息最后更新的时间
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
