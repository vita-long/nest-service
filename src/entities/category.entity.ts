import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

export enum CategoryType {
  POINT = 'point',
  PRODUCT = 'product',
}

/**
 * 分类实体类
 * 用于存储产品分类信息，支持层级结构
 */
@Entity()
export class Category {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 分类名称
   * 分类的显示名称，不能为空
   */
  @Column({
    name: 'category_name',
    nullable: false,
    length: 100,
    comment: '分类名称',
  })
  categoryName: string;

  /**
   * 分类描述
   * 对分类的详细描述，可选
   */
  @Column({
    name: 'description',
    nullable: true,
    length: 500,
    comment: '分类描述',
  })
  description?: string;

  /**
   * 父分类ID
   * 用于实现层级分类，顶级分类为null
   */
  @Column({ name: 'parent_id', nullable: true, comment: '父分类ID' })
  parentId?: number;

  /**
   * 分类图标
   * 分类的图标URL，可选
   */
  @Column({ name: 'icon', nullable: true, comment: '分类图标' })
  icon?: string;

  /**
   * 排序权重
   * 用于分类显示顺序，数值越小越靠前
   */
  @Column({ name: 'sort_order', default: 0, comment: '排序权重' })
  sortOrder: number;

  /**
   * 分类类型
   * 用于区分不同类型的分类，如商品分类、服务分类等
   * point: 积分分类，用于积分商品的分类
   * product: 商品分类，用于普通商品的分类
   */
  @Column({ name: 'type', nullable: true, length: 50, comment: '分类类型' })
  type?: CategoryType;

  /**
   * 分类状态
   * 是否启用该分类，默认为启用
   */
  @Column({ name: 'is_active', default: true, comment: '是否启用' })
  isActive: boolean;

  /**
   * 创建时间
   * 记录分类创建的时间戳
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录分类最后更新的时间戳
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  /**
   * 产品列表
   * 一对多关系，一个分类包含多个产品
   */
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
