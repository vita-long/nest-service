import { IsNotEmpty, IsNumber, Min } from 'class-validator';

/**
 * 发放优惠券DTO
 * 用于验证发放优惠券时的请求数据
 */
export class IssueCouponDto {
  @IsNotEmpty({ message: '优惠券ID不能为空' })
  couponId: number;

  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: string;

  @IsNotEmpty({ message: '数量不能为空' })
  @IsNumber({}, { message: '数量必须是数字' })
  @Min(1, { message: '数量至少为1' })
  quantity: number;
}
