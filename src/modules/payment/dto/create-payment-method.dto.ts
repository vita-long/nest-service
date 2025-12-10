import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

/**
 * 创建支付方式DTO
 */
export class CreatePaymentMethodDto {

  @IsNotEmpty({ message: '支付方式名称不能为空' })
  @IsString({ message: '支付方式名称必须是字符串' })
  name: string;

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
