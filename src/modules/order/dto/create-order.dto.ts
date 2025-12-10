import { IsNotEmpty, IsNumber, Min, IsOptional, IsObject, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 收货地址验证类
class ShippingAddressDto {
  @IsNotEmpty({ message: '收货人姓名不能为空' })
  name: string;

  @IsNotEmpty({ message: '收货人电话不能为空' })
  phone: string;

  @IsNotEmpty({ message: '省份不能为空' })
  province: string;

  @IsNotEmpty({ message: '城市不能为空' })
  city: string;

  @IsNotEmpty({ message: '区/县不能为空' })
  district: string;

  @IsNotEmpty({ message: '详细地址不能为空' })
  address: string;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: string;

  @IsNotEmpty({ message: '订单总金额不能为空' })
  @IsNumber({}, { message: '订单总金额必须是数字' })
  @Min(0, { message: '订单总金额不能为负数' })
  totalAmount: number;

  @IsOptional()
  paymentMethod?: string;

  @IsOptional()
  @IsObject({ message: '收货地址必须是对象格式' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @IsOptional()
  remark?: string;
}
