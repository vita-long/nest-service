import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

/**
 * 订单明细实体类
 * 用于存储订单中的产品明细信息
 */
@Entity({ name: 'order_items' })
export class OrderItem {
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
   * 产品ID
   * 外键，关联到产品表
   */
  @Column({ name: 'product_id', nullable: false, comment: '产品ID' })
  productId: number;

  /**
   * 产品名称
   * 订单创建时的产品名称（快照）
   */
  @Column({ name: 'product_name', nullable: false, length: 255, comment: '产品名称' })
  productName: string;

  /**
   * 产品单价
   * 订单创建时的产品单价（快照）
   */
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: false, comment: '产品单价' })
  unitPrice: number;

  /**
   * 购买数量
   * 该产品的购买数量
   */
  @Column({ name: 'quantity', type: 'int', nullable: false, comment: '购买数量' })
  quantity: number;

  /**
   * 小计金额
   * 该产品的小计金额（单价 * 数量）
   */
  @Column({ name: 'subtotal_amount', type: 'decimal', precision: 10, scale: 2, nullable: false, comment: '小计金额' })
  subtotalAmount: number;

  /**
   * 产品图片
   * 订单创建时的产品图片（快照）
   */
  @Column({ name: 'product_image', nullable: true, comment: '产品图片' })
  productImage?: string;

  /**
   * 创建时间
   * 记录创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 所属订单
   * 多对一关系，多个订单明细属于一个订单
   */
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  /**
   * 产品信息
   * 多对一关系，多个订单明细可以对应同一个产品
   */
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}