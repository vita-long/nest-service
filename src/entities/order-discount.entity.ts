import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Coupon } from './coupons.entity';

/**
 * 订单优惠明细实体类
 * 用于存储订单中使用的优惠券信息
 */
@Entity({ name: 'order_discounts' })
export class OrderDiscount {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 订单ID
   * 外键，关联到订单表
   */
  @Column({ name: 'order_id', nullable: false, comment: '订单ID' })
  orderId: number;

  /**
   * 优惠券ID
   * 外键，关联到优惠券表
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
   * 优惠券名称
   * 优惠券的显示名称
   */
  @Column({ name: 'coupon_name', nullable: false, length: 255, comment: '优惠券名称' })
  couponName: string;

  /**
   * 优惠金额
   * 该优惠券在订单中实际抵扣的金额
   */
  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: false, comment: '优惠金额' })
  discountAmount: number;

  /**
   * 创建时间
   * 记录创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 所属订单
   * 多对一关系，多个订单优惠明细属于一个订单
   */
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  /**
   * 优惠券信息
   * 多对一关系，多个订单优惠明细可以对应同一个优惠券
   */
  @ManyToOne(() => Coupon, (coupon) => coupon.id)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;
}