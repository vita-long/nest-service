import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { MemberLevel } from './member-level.entity';

/**
 * 会员信息实体类
 * 用于存储用户的会员信息，包括当前等级、成长值、积分等
 */
@Entity('member_info')
export class MemberInfo {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户ID
   * 外键，关联到用户表
   */
  @Column({ name: 'user_id', nullable: false, unique: true, comment: '用户ID' })
  userId: number;

  /**
   * 用户
   * 一对一关系，关联到用户实体
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 当前等级ID
   * 外键，关联到会员等级表
   */
  @Column({ name: 'current_level_id', nullable: false, comment: '当前等级ID' })
  currentLevelId: number;

  /**
   * 当前等级
   * 多对一关系，关联到会员等级实体
   */
  @ManyToOne(() => MemberLevel)
  @JoinColumn({ name: 'current_level_id' })
  currentLevel: MemberLevel;



  /**
   * 积分
   * 用户当前的积分，可用于兑换或抵扣
   */
  @Column({ name: 'points', type: 'int', default: 0, comment: '积分' })
  points: number;

  /**
   * 会员过期时间
   * 当前会员等级的过期时间，null表示永久有效
   */
  @Column({ name: 'expire_time', nullable: true, comment: '会员过期时间' })
  expireTime?: Date;

  /**
   * 免运费券余额
   * 用户当前持有的免运费券数量
   */
  @Column({ name: 'free_shipping_tickets_balance', type: 'int', default: 0, comment: '免运费券余额' })
  freeShippingTicketsBalance: number;

  /**
   * 免费花束升级次数余额
   * 用户当前剩余的免费花束升级次数
   */
  @Column({ name: 'free_bouquet_upgrades_balance', type: 'int', default: 0, comment: '免费花束升级次数余额' })
  freeBouquetUpgradesBalance: number;

  /**
   * 订阅状态
   * 用户当前的订阅状态
   */
  @Column({ name: 'subscription_status', type: 'enum', enum: ['active', 'inactive', 'expired'], default: 'inactive', comment: '订阅状态' })
  subscriptionStatus: 'active' | 'inactive' | 'expired';

  /**
   * 创建时间
   * 记录会员信息创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录会员信息最后更新的时间
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
