import { IsOptional, IsString, IsBoolean, IsNumber, IsObject } from 'class-validator';

/**
 * 更新支付方式DTO
 */
export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString({ message: '支付方式代码必须是字符串' })
  code?: string;

  @IsOptional()
  @IsString({ message: '支付方式名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '支付方式描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '图标URL必须是字符串' })
  iconUrl?: string;

  @IsOptional()
  @IsObject({ message: '配置参数必须是对象' })
  config?: Record<string, any>;

  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isEnabled?: boolean;

  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sortOrder?: number;
}
