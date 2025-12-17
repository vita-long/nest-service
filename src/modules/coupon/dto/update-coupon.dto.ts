import { IsOptional, MaxLength, IsEnum, IsNumber, Min, IsDate, IsJSON, IsArray, ArrayUnique } from 'class-validator';
import { CouponType, CouponSource, CouponStatus } from '../../../entities/coupons.entity';

/**
 * 更新优惠券DTO
 * 用于验证更新优惠券时的请求数据
 */
export class UpdateCouponDto {
  @IsOptional()
  @MaxLength(50, { message: '优惠券代码不能超过50个字符' })
  code?: string;

  @IsOptional()
  @MaxLength(255, { message: '优惠券名称不能超过255个字符' })
  name?: string;

  @IsOptional()
  @IsEnum(CouponType, { message: '无效的优惠券类型' })
  type?: CouponType;

  @IsOptional()
  @IsNumber({}, { message: '优惠券价值必须是数字' })
  @Min(0, { message: '优惠券价值不能为负数' })
  value?: number;

  @IsOptional()
  @IsDate({ message: '无效的开始时间格式' })
  startTime?: Date;

  @IsOptional()
  @IsDate({ message: '无效的结束时间格式' })
  endTime?: Date;

  @IsOptional()
  @IsArray({ message: '产品范围必须是数组' })
  @ArrayUnique({ message: '产品范围必须包含唯一值' })
  productScope?: string[];

  @IsOptional()
  @IsJSON({ message: '发放条件必须是有效的JSON字符串' })
  issueCondition?: any;

  @IsOptional()
  @IsJSON({ message: '额外属性必须是有效的JSON字符串' })
  extraProperties?: any;

  @IsOptional()
  @IsNumber({}, { message: '剩余数量必须是数字' })
  @Min(0, { message: '剩余数量不能为负数' })
  remainingQuantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '总数量必须是数字' })
  @Min(0, { message: '总数量不能为负数' })
  totalQuantity?: number;

  @IsOptional()
  @IsEnum(CouponStatus, { message: '无效的优惠券状态' })
  status?: CouponStatus;

  @IsOptional()
  @IsEnum(CouponSource, { message: '无效的优惠券来源' })
  source?: CouponSource;
}