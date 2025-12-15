import { IsOptional, MaxLength, IsNumber, Min, IsBoolean, IsArray } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @MaxLength(255, { message: 'Product name must be less than 255 characters' })
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'basePrice must be a number' })
  @Min(0, { message: 'basePrice cannot be negative' })
  basePrice: number;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Sales must be a number' })
  @Min(0, { message: 'Sales cannot be negative' })
  sales?: number;

  @IsOptional()
  mainImage?: string;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  images?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isNew must be a boolean' })
  isNew?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isRecommend must be a boolean' })
  isRecommend?: boolean;

  @IsOptional()
  categoryId?: string;
}