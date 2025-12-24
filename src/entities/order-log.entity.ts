import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

/**
 * 订单日志实体类
 * 用于记录订单的操作历史
 */
@Entity({ name: 'order_logs' })
export class OrderLog {
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
   * 操作人
   * 执行操作的人员ID（系统或用户）
   */
  @Column({ name: 'operator', nullable: true, comment: '操作人' })
  operator?: string;

  /**
   * 操作类型
   * 执行的操作类型：创建订单、支付订单、取消订单等
   */
  @Column({
    name: 'operation_type',
    nullable: false,
    length: 50,
    comment: '操作类型',
  })
  operationType: string;

  /**
   * 操作内容
   * 详细的操作描述
   */
  @Column({
    name: 'operation_content',
    type: 'text',
    nullable: false,
    comment: '操作内容',
  })
  operationContent: string;

  /**
   * 订单状态变更
   * 操作前后的订单状态变更（JSON格式）
   */
  @Column({
    name: 'status_change',
    type: 'json',
    nullable: true,
    comment: '订单状态变更',
  })
  statusChange?: {
    from: string;
    to: string;
  };

  /**
   * 创建时间
   * 记录创建的时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 所属订单
   * 多对一关系，多个订单日志属于一个订单
   */
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
