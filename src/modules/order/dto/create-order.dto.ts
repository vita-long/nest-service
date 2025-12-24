import { IsNotEmpty, IsNumber, Min, IsOptional, IsObject, ValidateNested, IsString, IsArray, IsUUID, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

// 产品信息验证类
class OrderProductDto {
  @IsNotEmpty({ message: '产品ID不能为空' })
  @IsNumber({}, { message: '产品ID必须是数字' })
  productId: number;

  @IsNotEmpty({ message: '产品数量不能为空' })
  @IsNumber({}, { message: '产品数量必须是数字' })
  @Min(1, { message: '产品数量不能小于1' })
  quantity: number;
}

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
  @IsNumber({}, { message: '用户ID必须是数字' })
  userId: number;

  @IsNotEmpty({ message: '订单总金额不能为空' })
  @IsNumber({}, { message: '订单总金额必须是数字' })
  @Min(0, { message: '订单总金额不能小于0' })
  totalAmount: number;

  @IsNotEmpty({ message: '产品列表不能为空' })
  @IsArray({ message: '产品列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @IsOptional()
  @IsArray({ message: '优惠券ID列表必须是数组' })
  @IsNumber({}, { each: true, message: '优惠券ID必须是数字' })
  couponIds?: number[];

  @IsOptional()
  paymentMethod?: string;

  @IsNotEmpty({ message: '收货地址不能为空' })
  @IsObject({ message: '收货地址必须是对象格式' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  remark?: string;
}
