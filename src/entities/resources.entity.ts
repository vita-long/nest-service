import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

/**
 * 资源实体类
 * 用于存储系统中的资源信息，如文件、图片等
 */
@Entity()
export class Resources {
  /**
   * ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 资源ID
   * 自定义生成的资源标识
   */
  @Column({ name: 'resource_id', unique: true, nullable: false, comment: '资源ID' })
  resourceId: string;

  /**
   * 资源名称
   * 资源的显示名称，不能为空
   */
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: '资源名称',
  })
  name: string;

  /**
   * 文件原始名称
   * 用户上传时的原始文件名
   */
  @Column({
    name: 'original_name',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: '文件原始名称',
  })
  originalName: string;

  /**
   * 资源路径
   * 文件在服务器上的存储路径
   */
  @Column({
    name: 'path',
    type: 'varchar',
    length: 500,
    nullable: false,
    comment: '资源路径',
  })
  path: string;

  /**
   * 资源类型
   * 资源的分类类型，如image、document等
   */
  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '资源类型',
  })
  type: string;

  /**
   * 文件格式
   * 文件的扩展名或MIME类型
   */
  @Column({
    name: 'format',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '文件格式',
  })
  format: string;

  /**
   * 文件大小
   * 以字节为单位的文件大小
   */
  @Column({
    name: 'size',
    type: 'bigint',
    nullable: false,
    default: 0,
    comment: '文件大小（字节）',
  })
  size: number;

  /**
   * 上传用户ID
   * 关联到用户表的外键
   */
  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '上传用户ID',
  })
  @Index()
  userId: string;

  /**
   * 资源状态
   * 0: 禁用, 1: 启用, 2: 已删除
   */
  @Column({
    name: 'status',
    type: 'tinyint',
    nullable: false,
    default: 1,
    comment: '资源状态(0:禁用,1:启用,2:已删除)',
  })
  status: number;

  /**
   * 创建时间
   */
  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    comment: '创建时间',
  })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    comment: '更新时间',
  })
  updatedAt: Date;
}
