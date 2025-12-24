import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 支付方式实体
 */
@Entity('payment_methods')
export class PaymentMethod {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 支付方式代码
   * 唯一标识，如：alipay, wechatpay, unionpay
   */
  @Column({
    name: 'code',
    unique: true,
    nullable: false,
    comment: '支付方式代码',
  })
  code: string;

  /**
   * 支付方式名称
   * 显示名称，如：支付宝、微信支付、银联支付
   */
  @Column({ name: 'name', nullable: false, comment: '支付方式名称' })
  name: string;

  /**
   * 支付方式描述
   * 支付方式的详细描述
   */
  @Column({ name: 'description', nullable: true, comment: '支付方式描述' })
  description?: string;

  /**
   * 图标URL
   * 支付方式的图标链接
   */
  @Column({ name: 'icon_url', nullable: true, comment: '图标URL' })
  iconUrl?: string;

  /**
   * 配置参数
   * 支付方式的配置参数，JSON格式存储
   */
  @Column({ name: 'config', type: 'json', nullable: true, comment: '配置参数' })
  config?: Record<string, any>;

  /**
   * 是否启用
   * 支付方式是否可用
   */
  @Column({ name: 'is_enabled', default: true, comment: '是否启用' })
  isEnabled: boolean;

  /**
   * 排序
   * 支付方式的显示顺序
   */
  @Column({ name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  /**
   * 创建时间
   * 记录创建的时间，自动生成
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录更新的时间，自动生成
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
