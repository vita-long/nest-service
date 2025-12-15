import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * 积分历史记录实体类
 * 用于记录用户积分的变化历史
 */
@Entity('points_histories')
export class PointsHistory {
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
   * 积分变化的类型：增加(increase)或减少(decrease)
   */
  @Column({ name: 'type', type: 'enum', enum: ['increase', 'decrease'], nullable: false, comment: '变化类型' })
  type: 'increase' | 'decrease';

  /**
   * 变化原因
   * 积分变化的原因，如"消费"、"兑换"、"生日赠送"等
   */
  @Column({ name: 'reason', nullable: false, length: 100, comment: '变化原因' })
  reason: string;

  /**
   * 变化数量
   * 积分变化的数量
   */
  @Column({ name: 'amount', type: 'int', nullable: false, comment: '变化数量' })
  amount: number;

  /**
   * 变化前积分
   * 积分变化前的数量
   */
  @Column({ name: 'previous_points', type: 'int', nullable: false, comment: '变化前积分' })
  previousPoints: number;

  /**
   * 变化后积分
   * 积分变化后的数量
   */
  @Column({ name: 'current_points', type: 'int', nullable: false, comment: '变化后积分' })
  currentPoints: number;

  /**
   * 订单ID
   * 如果积分变化与订单相关，记录订单ID
   */
  @Column({ name: 'order_id', nullable: true, comment: '订单ID' })
  orderId?: string;

  /**
   * 过期时间
   * 积分的过期时间，用于滚动清零
   */
  @Column({ name: 'expire_time', nullable: true, comment: '过期时间' })
  expireTime?: Date;

  /**
   * 创建时间
   * 记录积分变化的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
}
