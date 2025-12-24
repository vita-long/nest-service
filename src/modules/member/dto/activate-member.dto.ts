import { IsNumber, IsNotEmpty, IsEnum } from 'class-validator';

/**
 * 会员状态枚举
 */
export enum ActiveStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}
/**
 * 激活会员状态的数据传输对象
 */
export class ActivateMemberDto {
  /**
   * 用户ID
   */
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  /**
   * 会员状态
   */
  @IsEnum(ActiveStatus)
  active: ActiveStatus;
}