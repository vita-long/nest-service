import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ProductType } from '../../../entities/product.entity';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(255, { message: 'Product name must be less than 255 characters' })
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'basePrice is required' })
  @IsNumber({}, { message: 'basePrice must be a number' })
  @Min(0, { message: 'basePrice cannot be negative' })
  basePrice: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsOptional()
  // @IsNumber({}, { message: 'Stock must be a number' })
  // @Min(0, { message: 'Stock cannot be negative' })
  stock?: number = 0;

  @IsOptional()
  // @IsNumber({}, { message: 'Sales must be a number' })
  // @Min(0, { message: 'Sales cannot be negative' })
  sales?: number = 0;

  @IsOptional()
  mainImage?: string;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  images?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean({ message: 'isNew must be a boolean' })
  isNew?: boolean = false;

  @IsOptional()
  @IsBoolean({ message: 'isRecommend must be a boolean' })
  isRecommend?: boolean = false;

  @IsNotEmpty({ message: 'Category ID is required' })
  @IsNumber({}, { message: 'Category ID must be a number' })
  categoryId: number;

  @IsOptional()
  @IsEnum(ProductType, { message: 'Invalid product type' })
  productType?: ProductType;

  @IsOptional()
  @IsNumber({}, { message: 'Points price must be a number' })
  @Min(0, { message: 'Points price cannot be negative' })
  pointsPrice?: number;
}
