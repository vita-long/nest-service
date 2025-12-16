import { IsString, IsBoolean, IsNotEmpty, IsEnum } from 'class-validator';

type Active = 'active' | 'inactive' | 'expired';
/**
 * 激活会员状态的数据传输对象
 */
export class ActivateMemberDto {
  /**
   * 用户ID
   */
  @IsString()
  @IsNotEmpty()
  userId: string;

  /**
   * 会员状态
   */
  @IsEnum({})
  active: Active;
}