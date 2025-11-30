import { IsNotEmpty } from 'class-validator';

/**
 * 刷新令牌DTO
 */
export class RefreshTokenDto {
  /**
   * 刷新令牌
   */
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  refreshToken: string;
}