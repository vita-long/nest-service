import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

/**
 * 购物车实体类
 * 用于存储用户的购物车商品信息
 */
@Entity({ name: 'cart' })
export class Cart {
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
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  /**
   * 商品ID
   * 关联到商品表
   */
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  /**
   * 商品数量
   * 购物车中该商品的数量
   */
  @Column({
    name: 'quantity',
    type: 'int',
    nullable: false,
    default: 1,
    comment: '商品数量',
  })
  quantity: number;

  /**
   * 商品规格
   * 购物车中该商品的规格
   */
  @Column({
    name: 'specifications',
    type: 'json',
    nullable: true,
    comment: '商品规格',
  })
  specifications?: any;

  /**
   * 商品价格
   * 购物车中该商品的价格
   */
  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '商品价格',
  })
  price: number;

  /**
   * 选中状态
   * 购物车中该商品是否被选中
   */
  @Column({
    name: 'is_selected',
    type: 'boolean',
    nullable: false,
    default: true,
    comment: '选中状态',
  })
  isSelected: boolean;

  /**
   * 创建时间
   * 购物车商品创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 购物车商品最后更新的时间
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
