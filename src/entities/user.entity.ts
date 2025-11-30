import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 用户实体类
 * 用于存储系统用户的基本信息和账户状态
 */
@Entity()
export class User {
  /**
   * 用户ID
   * 主键，自增生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户名
   * 登录账号，必须唯一且不能为空
   */
  @Column({ unique: true, nullable: false, comment: '用户名' })
  username: string;

  /**
   * 电子邮箱
   * 用于账号验证和通知，唯一，可选
   */
  @Column({ unique: true, nullable: true, comment: '电子邮箱' })
  email?: string;

  /**
   * 密码
   * 存储加密后的密码，不能为空
   */
  @Column({ nullable: false, comment: '密码' })
  password: string;

  /**
   * 手机号码
   * 用于账号验证和通知，唯一，可选
   */
  @Column({ unique: true, nullable: true, comment: '手机号码' })
  phone?: string;

  /**
   * 第三方平台OpenID
   * 用于第三方登录绑定，唯一，可选
   */
  @Column({ unique: true, nullable: true, comment: '第三方平台OpenID' })
  openid?: string;

  /**
   * 用户角色
   * 定义用户权限级别，默认为普通用户'user'
   */
  @Column({ default: 'user', comment: '用户角色' })
  role: string;

  /**
   * 账号激活状态
   * 标识用户是否已激活账号，默认为激活
   */
  @Column({ default: true, comment: '是否激活' })
  isActive: boolean;

  /**
   * 登录状态
   * 标识用户当前是否在线，1-在线，0-离线，默认为离线
   */
  @Column({ default: false, comment: '登录状态: 1-在线，0-离线' })
  status: boolean;

  /**
   * 用户昵称
   * 显示名称，可选，最大长度255
   */
  @Column({ nullable: true, length: 255, comment: '用户昵称' })
  nickname?: string;

  /**
   * 头像URL
   * 用户头像图片的存储路径，可选
   */
  @Column({ nullable: true, comment: '头像URL' })
  avatar?: string;

  /**
   * 个人简介
   * 用户的自我介绍信息，可选，最大长度500
   */
  @Column({ nullable: true, length: 500, comment: '个人简介' })
  bio?: string;

  /**
   * 最后登录时间
   * 记录用户最近一次登录的时间，可选
   */
  @Column({ nullable: true, comment: '最后登录时间' })
  lastLoginTime?: Date;

  /**
   * 最后登录IP
   * 记录用户最近一次登录的IP地址，可选
   */
  @Column({ nullable: true, comment: '最后登录IP' })
  lastLoginIp?: string;

  /**
   * 创建时间
   * 记录用户账号创建的时间，自动生成
   */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   * 记录用户信息最后更新的时间，自动生成
   */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  /**
   * 删除时间
   * 用于软删除功能，记录用户账号标记删除的时间，可选
   */
  @Column({ nullable: true, comment: '删除时间' })
  deletedAt?: Date;
}