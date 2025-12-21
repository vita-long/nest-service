import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 微信登录DTO
 */
export class WechatLoginDto {
  /**
   * 微信登录授权码
   */
  @IsNotEmpty({
    message: '微信登录授权码不能为空',
  })
  @IsString({
    message: '微信登录授权码必须是字符串',
  })
  readonly code: string;

  /**
   * 微信用户昵称
   */
  @IsNotEmpty({
    message: '微信用户昵称不能为空',
  })
  @IsString({
    message: '微信用户昵称必须是字符串',
  })
  readonly nickname: string;

  /**
   * 微信用户头像URL
   */
  @IsNotEmpty({
    message: '微信用户头像URL不能为空',
  })
  @IsString({
    message: '微信用户头像URL必须是字符串',
  })
  readonly avatar: string;
}
