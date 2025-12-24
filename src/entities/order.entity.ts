import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { OrderDiscount } from './order-discount.entity';
import { OrderLog } from './order-log.entity';

/**
 * 订单实体类
 * 用于存储订单的基本信息和状态
 */
@Entity()
export class Order {
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
  userId: number;

  /**
   * 商品总金额
   * 订单中所有商品的总金额（不含优惠）
   */
  @Column({
    name: 'goods_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '商品总金额',
  })
  goodsAmount: number;

  /**
   * 优惠总金额
   * 订单中所有优惠的总金额
   */
  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: false,
    comment: '优惠总金额',
  })
  discountAmount: number;

  /**
   * 订单总金额
   * 订单的最终支付金额（商品总金额 - 优惠总金额）
   */
  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '订单总金额',
  })
  totalAmount: number;

  /**
   * 订单状态
   * 订单的当前状态：待支付、已支付、已发货、已完成、已取消
   */
  @Column({
    name: 'status',
    default: 'pending',
    comment:
      '订单状态：pending-待支付, paid-已支付, shipped-已发货, completed-已完成, cancelled-已取消',
  })
  status: string;

  /**
   * 支付方式
   * 用户选择的支付方式
   */
  @Column({ name: 'payment_method', nullable: true, comment: '支付方式' })
  paymentMethod?: string;

  /**
   * 支付时间
   * 订单支付完成的时间
   */
  @Column({ name: 'payment_time', nullable: true, comment: '支付时间' })
  paymentTime?: Date;

  /**
   * 收货地址
   * 订单的收货地址信息，JSON格式存储
   */
  @Column({
    name: 'shipping_address',
    type: 'json',
    nullable: true,
    comment: '收货地址',
  })
  shippingAddress?: {
    name: string; // 收货人
    phone: string; // 收货人手机号
    province: string; // 省份
    city: string; // 城市
    district: string; // 区县
    address: string; // 详细地址
  };

  /**
   * 订单备注
   * 用户或商家添加的订单备注信息
   */
  @Column({ name: 'remark', nullable: true, length: 500, comment: '订单备注' })
  remark?: string;

  /**
   * 发货时间
   * 订单发货的时间
   */
  @Column({ name: 'shipping_time', nullable: true, comment: '发货时间' })
  shippingTime?: Date;

  /**
   * 完成时间
   * 订单完成的时间
   */
  @Column({ name: 'completed_time', nullable: true, comment: '完成时间' })
  completedTime?: Date;

  /**
   * 创建时间
   * 记录订单创建的时间，自动生成
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录订单最后更新的时间，自动生成
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  /**
   * 所属用户
   * 多对一关系，多个订单属于一个用户
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 订单明细
   * 一对多关系，一个订单包含多个订单明细
   */
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  /**
   * 订单优惠明细
   * 一对多关系，一个订单可以使用多个优惠券
   */
  @OneToMany(() => OrderDiscount, (orderDiscount) => orderDiscount.order)
  orderDiscounts: OrderDiscount[];

  /**
   * 订单日志
   * 一对多关系，一个订单包含多个操作日志
   */
  @OneToMany(() => OrderLog, (orderLog) => orderLog.order)
  orderLogs: OrderLog[];
}
