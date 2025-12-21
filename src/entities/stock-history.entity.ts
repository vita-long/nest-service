import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

/**
 * 库存历史记录实体类
 * 用于记录产品库存变化的历史记录
 */
@Entity('stock_histories')
export class StockHistory {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 产品ID
   * 外键，关联到产品表
   */
  @Column({ name: 'product_id', nullable: false, comment: '产品ID' })
  productId: string;

  /**
   * 产品
   * 多对一关系，关联到产品实体
   * 使用级联删除，当产品被删除时，相关的库存历史记录也会被自动删除
   */
  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product: Product;

  /**
   * 变化前库存
   * 库存变化前的数量
   */
  @Column({ name: 'previous_stock', type: 'int', nullable: false, comment: '变化前库存' })
  previousStock: number;

  /**
   * 变化数量
   * 库存变化的数量（正数表示增加，负数表示减少）
   */
  @Column({ name: 'change_quantity', type: 'int', nullable: false, comment: '变化数量' })
  changeQuantity: number;

  /**
   * 变化后库存
   * 库存变化后的数量
   */
  @Column({ name: 'current_stock', type: 'int', nullable: false, comment: '变化后库存' })
  currentStock: number;

  /**
   * 库存类型
   * 库存变化的类型：purchase（采购）、sale（销售）、adjustment（调整）
   */
  @Column({ name: 'type', nullable: false, comment: '库存类型: purchase(采购), sale(销售), adjustment(调整)' })
  type: 'purchase' | 'sale' | 'adjustment';

  /**
   * 操作人
   * 执行库存操作的人员
   */
  @Column({ name: 'operator', nullable: true, comment: '操作人' })
  operator?: string;

  /**
   * 备注
   * 库存变化的备注信息
   */
  @Column({ name: 'remark', nullable: true, type: 'text', comment: '备注' })
  remark?: string;

  /**
   * 创建时间
   * 记录创建的时间
   */
  @CreateDateColumn({ name: 'created_at', type: 'datetime', comment: '创建时间' })
  createdAt: Date;
}
