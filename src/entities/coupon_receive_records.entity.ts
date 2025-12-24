import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Coupon } from './coupons.entity';

/**
 * 优惠券使用状态枚举
 */
export enum CouponUseStatus {
  UNUSED = 'unused',      // 未使用
  USED = 'used',          // 已使用
  EXPIRED = 'expired'     // 已过期
}

/**
 * 优惠券领取记录实体类
 * 用于存储用户领取优惠券的记录
 */
@Entity({ name: 'coupon_receive_records' })
export class CouponReceiveRecord {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户ID
   * 关联到用户表
   */
  @Column({ name: 'user_id', nullable: false, comment: '用户ID' })
  userId: number;

  /**
   * 优惠券ID
   * 关联到优惠券表
   */
  @Column({ name: 'coupon_id', nullable: false, comment: '优惠券ID' })
  couponId: number;

  /**
   * 优惠券码
   * 优惠券的唯一标识
   */
  @Column({ name: 'coupon_code', nullable: false, length: 50, comment: '优惠券码' })
  couponCode: string;

  /**
   * 领取时间
   * 用户领取优惠券的时间
   */
  @Column({ name: 'receive_time', type: 'datetime', nullable: false, comment: '领取时间' })
  receiveTime: Date;

  /**
   * 使用状态
   * 优惠券的使用状态：未使用、已使用、已过期
   */
  @Column({ name: 'status', type: 'enum', enum: CouponUseStatus, default: CouponUseStatus.UNUSED, comment: '使用状态' })
  status: CouponUseStatus;

  /**
   * 使用时间
   * 用户使用优惠券的时间
   */
  @Column({ name: 'used_time', type: 'datetime', nullable: true, comment: '使用时间' })
  usedTime?: Date;

  /**
   * 订单ID
   * 关联的订单ID（如果已使用）
   */
  @Column({ name: 'order_id', nullable: true, comment: '订单ID' })
  orderId?: number;

  /**
   * 创建时间
   * 记录创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录最后更新的时间
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  /**
   * 用户信息
   * 关联到用户实体
   */
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 优惠券信息
   * 关联到优惠券实体
   */
  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;
}