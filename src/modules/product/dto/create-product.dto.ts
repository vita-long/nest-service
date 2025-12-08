import { IsNotEmpty, IsOptional, MaxLength, IsNumber, Min, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(255, { message: 'Product name must be less than 255 characters' })
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  // @IsNotEmpty({ message: 'Price is required' })
  // @IsNumber({}, { message: 'Price must be a number' })
  // @Min(0, { message: 'Price cannot be negative' })
  price?: number;

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
  categoryId: string;
}