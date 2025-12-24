import { IsNotEmpty, IsNumber, Min, IsString, IsEnum } from 'class-validator';

/**
 * 调整积分的数据传输对象
 */
export class AdjustPointsDto {
  /**
   * 用户ID
   * 必须不为空
   */
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  /**
   * 调整数量
   * 必须是数字且不等于0
   */
  @IsNumber()
  @Min(1)
  amount: number;

  /**
   * 调整类型
   * 积分调整的类型：增加(increase)或减少(decrease)
   */
  @IsEnum(['increase', 'decrease'])
  type: 'increase' | 'decrease';

  /**
   * 调整原因
   * 必须不为空，长度不超过100
   */
  @IsString()
  @IsNotEmpty()
  reason: string;
}
