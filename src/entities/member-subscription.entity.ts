import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { MemberLevel } from './member-level.entity';

/**
 * 会员订阅实体类
 * 用于记录用户的会员订阅信息
 */
@Entity('member_subscriptions')
export class MemberSubscription {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 订阅ID
   * 自定义生成的订阅标识
   */
  @Column({ name: 'subscription_id', unique: true, nullable: false, comment: '订阅ID' })
  subscriptionId: string;

  /**
   * 用户ID
   * 外键，关联到用户表
   */
  @Column({ name: 'user_id', nullable: false, comment: '用户ID' })
  userId: number;

  /**
   * 用户
   * 多对一关系，关联到用户实体
   */
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 会员等级ID
   * 外键，关联到会员等级表
   */
  @Column({ name: 'level_id', nullable: false, comment: '会员等级ID' })
  levelId: number;

  /**
   * 会员等级
   * 多对一关系，关联到会员等级实体
   */
  @ManyToOne(() => MemberLevel, (level) => level.id)
  @JoinColumn({ name: 'level_id' })
  level: MemberLevel;

  /**
   * 订阅开始时间
   * 订阅服务的开始时间
   */
  @Column({ name: 'start_time', nullable: false, comment: '订阅开始时间' })
  startTime: Date;

  /**
   * 订阅结束时间
   * 订阅服务的结束时间
   */
  @Column({ name: 'end_time', nullable: false, comment: '订阅结束时间' })
  endTime: Date;

  /**
   * 订阅价格
   * 实际支付的订阅价格
   */
  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: false, comment: '订阅价格' })
  price: number;

  /**
   * 支付状态
   * 订阅的支付状态：unpaid(未支付)、paid(已支付)、refunded(已退款)
   */
  @Column({ name: 'payment_status', type: 'enum', enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid', comment: '支付状态' })
  paymentStatus: 'unpaid' | 'paid' | 'refunded';

  /**
   * 订阅状态
   * 订阅的当前状态：active(激活)、expired(过期)、cancelled(已取消)
   */
  @Column({ name: 'status', type: 'enum', enum: ['active', 'expired', 'cancelled'], default: 'active', comment: '订阅状态' })
  status: 'active' | 'expired' | 'cancelled';

  /**
   * 是否自动续订
   * 是否开启自动续订功能
   */
  @Column({ name: 'auto_renew', default: false, comment: '是否自动续订' })
  autoRenew: boolean;

  /**
   * 订单ID
   * 关联的支付订单ID
   */
  @Column({ name: 'order_id', nullable: true, comment: '订单ID' })
  orderId?: number;

  /**
   * 创建时间
   * 记录订阅创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录订阅信息最后更新的时间
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
