import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsJSON,
} from 'class-validator';

/**
 * 创建购物车DTO
 * 用于验证创建购物车商品时的请求数据
 */
export class CreateCartDto {
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsNumber({}, { message: '商品ID必须是数字' })
  id: number;

  // 正数是增加，负数是减少
  @IsOptional()
  @IsNumber({}, { message: '商品数量必须是数字' })
  quantity?: number = 1;

  @IsOptional()
  price: number;

  @IsOptional()
  @IsJSON({ message: '商品规格必须是有效的JSON字符串' })
  specifications?: any;

  @IsOptional()
  @IsBoolean({ message: '选中状态必须是布尔值' })
  isSelected?: boolean = true;
}

/**
 * 更新购物车DTO
 * 用于验证更新购物车商品时的请求数据
 */
export class UpdateCartDto {
  @IsOptional()
  @IsNumber({}, { message: '商品数量必须是数字' })
  @Min(1, { message: '商品数量不能小于1' })
  quantity?: number;

  @IsOptional()
  @IsBoolean({ message: '选中状态必须是布尔值' })
  isSelected?: boolean;

  @IsOptional()
  @IsJSON({ message: '商品规格必须是有效的JSON字符串' })
  specifications?: any;
}

/**
 * 批量更新购物车DTO
 * 用于验证批量更新购物车商品时的请求数据
 */
export class BatchUpdateCartDto {
  @IsNotEmpty({ message: '购物车ID列表不能为空' })
  cartIds: number[];

  @IsOptional()
  @IsBoolean({ message: '选中状态必须是布尔值' })
  isSelected?: boolean;
}
