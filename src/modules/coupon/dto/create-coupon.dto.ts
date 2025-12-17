import { IsNotEmpty, IsOptional, MaxLength, IsEnum, IsNumber, Min, IsDate, IsJSON, IsArray, ArrayUnique } from 'class-validator';
import { CouponType, CouponSource } from '@/entities/coupons.entity';

/**
 * 创建优惠券DTO
 * 用于验证创建优惠券时的请求数据
 */
export class CreateCouponDto {
  @IsOptional()
  @IsNotEmpty({ message: '优惠券代码不能为空' })
  @MaxLength(50, { message: '优惠券代码不能超过50个字符' })
  code?: string;

  @IsNotEmpty({ message: '优惠券名称不能为空' })
  @MaxLength(255, { message: '优惠券名称不能超过255个字符' })
  name: string;

  @IsNotEmpty({ message: '优惠券类型不能为空' })
  @IsEnum(CouponType, { message: '无效的优惠券类型' })
  type: CouponType;

  @IsNotEmpty({ message: '优惠券价值不能为空' })
  @IsNumber({}, { message: '优惠券价值必须是数字' })
  @Min(0, { message: '优惠券价值不能为负数' })
  value: number;

  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsDate({ message: '无效的开始时间格式' })
  startTime: Date;

  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsDate({ message: '无效的结束时间格式' })
  endTime: Date;

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

  @IsNotEmpty({ message: '总数量不能为空' })
  @IsNumber({}, { message: '总数量必须是数字' })
  @Min(0, { message: '总数量不能为负数' })
  totalQuantity: number;

  @IsNotEmpty({ message: '来源不能为空' })
  @IsEnum(CouponSource, { message: '无效的优惠券来源' })
  source: CouponSource;


  @IsOptional()
  @MaxLength(255, { message: '优惠券描述不能超过255个字符' })
  description?: string;
}