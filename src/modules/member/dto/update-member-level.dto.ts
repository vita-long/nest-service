import { IsOptional, IsNotEmpty, IsNumber, IsDecimal, IsBoolean, IsInt, Min } from 'class-validator';

/**
 * 更新会员等级的数据传输对象
 */
export class UpdateMemberLevelDto {
  /**
   * 等级名称
   */
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  /**
   * 等级标识
   */
  @IsOptional()
  @IsNotEmpty()
  code?: string;

  /**
   * 订阅价格
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  subscriptionPrice?: number;

  /**
   * 订阅折扣率
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  subscriptionDiscount?: number;

  /**
   * 有效期
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  validityPeriod?: number;

  /**
   * 折扣率
   */
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  discountRate?: number;

  /**
   * 免运费券数量
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  freeShippingTickets?: number;

  /**
   * 是否无限免运费
   */
  @IsOptional()
  @IsBoolean()
  unlimitedFreeShipping?: boolean;

  /**
   * 免费花束升级次数
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  freeBouquetUpgrades?: number;

  /**
   * 是否赠送节日花礼
   */
  @IsOptional()
  @IsBoolean()
  holidayGifts?: boolean;

  /**
   * 是否激活
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * 描述
   */
  @IsOptional()
  description?: string;
}