import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';

export enum ProductType {
  Normal = 'normal',
  Points = 'points',
}

/**
 * 产品实体类
 * 用于存储产品信息，包括基本信息、价格、库存等
 */
@Entity()
export class Product {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 产品名称
   * 产品的显示名称，不能为空
   */
  @Column({ name: 'name', nullable: false, length: 255, comment: '产品名称' })
  name: string;

  /**
   * 产品描述
   * 对产品的详细描述，可选
   */
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    comment: '产品描述',
  })
  description?: string;

  /**
   * 基础价格
   * 产品的基础销售价格，不包含任何折扣或额外费用
   */
  @Column({
    name: 'base_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '基础价格',
  })
  basePrice: number;

  /**
   * 产品价格
   * 产品的销售价格，支持小数
   */
  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '产品价格',
  })
  price: number;

  /**
   * 库存数量
   * 产品当前的库存数量
   */
  @Column({ name: 'stock', type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  /**
   * 销量
   * 产品的累计销售数量
   */
  @Column({ name: 'sales', type: 'int', default: 0, comment: '销量' })
  sales: number;

  /**
   * 主图URL
   * 产品的主图片路径
   */
  @Column({ name: 'main_image', nullable: true, comment: '主图URL' })
  mainImage?: string;

  /**
   * 图片列表
   * 产品的所有图片路径，JSON格式存储
   */
  @Column({ name: 'images', type: 'json', nullable: true, comment: '图片列表' })
  images?: string[];

  /**
   * 产品状态
   * 是否上架销售，默认为上架
   */
  @Column({ name: 'is_active', default: true, comment: '是否上架' })
  isActive: boolean;

  /**
   * 是否新品
   * 标识该产品是否为新品
   */
  @Column({ name: 'is_new', default: false, comment: '是否新品' })
  isNew: boolean;

  /**
   * 是否推荐
   * 标识该产品是否为推荐产品
   */
  @Column({ name: 'is_recommend', default: false, comment: '是否推荐' })
  isRecommend: boolean;

  /**
   * 分类ID
   * 外键，关联到分类表
   */
  @Column({ name: 'category_id', nullable: false, comment: '分类ID' })
  categoryId: number;

  /**
   * 创建时间
   * 记录产品创建的时间戳
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录产品最后更新的时间戳
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  /**
   * 所属分类
   * 多对一关系，多个产品属于一个分类
   */
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  /**
   * 商品类型：普通商品 | 积分商品
   * 后续可能扩展其他类型
   */
  @Column({
    name: 'product_type',
    default: ProductType.Normal,
    comment: '商品类型',
  })
  productType: ProductType;

  /**
   * 积分商品价格
   * 积分商品的销售价格，用户需要积分才能购买
   */
  @Column({
    name: 'points_price',
    type: 'int',
    nullable: true,
    comment: '积分商品价格',
  })
  pointsPrice?: number;
}
