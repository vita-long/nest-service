import { IsOptional, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @MaxLength(100, { message: 'Category name must be less than 100 characters' })
  categoryName?: string;

  @IsOptional()
  @MaxLength(500, { message: 'Description must be less than 500 characters' })
  description?: string;

  @IsOptional()
  parentId?: string;

  @IsOptional()
  icon?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}