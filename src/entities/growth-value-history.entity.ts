import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * 成长值历史记录实体类
 * 用于记录用户成长值的变化历史
 */
@Entity('growth_value_histories')
export class GrowthValueHistory {
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
  @Column({ name: 'user_id', nullable: false, comment: '用户ID' })
  userId: string;

  /**
   * 用户
   * 多对一关系，关联到用户实体
   */
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  /**
   * 变化类型
   * 成长值变化的类型：增加(increase)或减少(decrease)
   */
  @Column({ name: 'type', type: 'enum', enum: ['increase', 'decrease'], nullable: false, comment: '变化类型' })
  type: 'increase' | 'decrease';

  /**
   * 变化原因
   * 成长值变化的原因，如"消费"、"订阅奖励"、"互动奖励"等
   */
  @Column({ name: 'reason', nullable: false, length: 100, comment: '变化原因' })
  reason: string;

  /**
   * 变化数量
   * 成长值变化的数量
   */
  @Column({ name: 'amount', type: 'int', nullable: false, comment: '变化数量' })
  amount: number;

  /**
   * 变化前成长值
   * 成长值变化前的数量
   */
  @Column({ name: 'previous_growth_value', type: 'int', nullable: false, comment: '变化前成长值' })
  previousGrowthValue: number;

  /**
   * 变化后成长值
   * 成长值变化后的数量
   */
  @Column({ name: 'current_growth_value', type: 'int', nullable: false, comment: '变化后成长值' })
  currentGrowthValue: number;

  /**
   * 订单ID
   * 如果成长值变化与订单相关，记录订单ID
   */
  @Column({ name: 'order_id', nullable: true, comment: '订单ID' })
  orderId?: string;

  /**
   * 订阅ID
   * 如果成长值变化与订阅相关，记录订阅ID
   */
  @Column({ name: 'subscription_id', nullable: true, comment: '订阅ID' })
  subscriptionId?: string;

  /**
   * 创建时间
   * 记录成长值变化的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
}
