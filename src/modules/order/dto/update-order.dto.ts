import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsObject,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

// 收货地址验证类
class ShippingAddressDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  province?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  district?: string;

  @IsOptional()
  address?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber({}, { message: '订单总金额必须是数字' })
  @Min(0, { message: '订单总金额不能为负数' })
  totalAmount?: number;

  @IsOptional()
  @IsString({ message: '订单状态必须是字符串' })
  status?: string;

  @IsOptional()
  @IsString({ message: '支付方式必须是字符串' })
  paymentMethod?: string;

  @IsOptional()
  @IsDate({ message: '支付时间必须是日期格式' })
  @Type(() => Date)
  paymentTime?: Date;

  @IsOptional()
  @IsObject({ message: '收货地址必须是对象格式' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @IsOptional()
  remark?: string;

  @IsOptional()
  @IsDate({ message: '发货时间必须是日期格式' })
  @Type(() => Date)
  shippingTime?: Date;

  @IsOptional()
  @IsDate({ message: '完成时间必须是日期格式' })
  @Type(() => Date)
  completedTime?: Date;
}
