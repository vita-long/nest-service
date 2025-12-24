import {
  IsNotEmpty,
  IsNumber,
  IsDecimal,
  IsBoolean,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

/**
 * 创建会员等级的数据传输对象
 */
export class CreateMemberLevelDto {
  /**
   * 等级名称
   * 必须不为空
   */
  @IsNotEmpty()
  name: string;

  /**
   * 等级标识
   * 必须不为空
   */
  @IsNotEmpty()
  code: string;

  /**
   * 订阅价格
   * 必须是数字且大于等于0
   */
  @Min(0)
  subscriptionPrice: number;

  /**
   * 订阅折扣率
   */
  @IsNumber()
  @Min(0)
  subscriptionDiscount?: number;

  /**
   * 有效期
   * 必须是整数且大于等于0（单位：月）0：无有效期
   */
  @IsInt()
  @Min(0)
  validityPeriod: number;

  /**
   * 折扣率
   * 0：无折扣
   */
  @IsNumber()
  @Min(0)
  discountRate: number;

  /**
   * 免运费券数量
   * 必须是整数且大于等于0
   */
  @IsInt()
  @Min(0)
  freeShippingTickets: number;

  /**
   * 是否无限免运费
   * 布尔类型
   */
  @IsBoolean()
  unlimitedFreeShipping: boolean;

  /**
   * 免费花束升级次数
   * 必须是整数且大于等于0
   */
  @IsInt()
  @Min(0)
  freeBouquetUpgrades: number;

  /**
   * 是否赠送节日花礼
   * 布尔类型
   */
  @IsBoolean()
  holidayGifts: boolean;

  /**
   * 是否激活
   * 布尔类型
   */
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  description?: string;
}
