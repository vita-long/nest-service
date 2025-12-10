import { IsNotEmpty, IsNumber, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class AdjustStockDto {
  @IsNotEmpty({ message: 'Change quantity is required' })
  @IsNumber({}, { message: 'Change quantity must be a number' })
  changeQuantity: number;

  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(['purchase', 'sale', 'adjustment'], { message: 'Type must be one of: purchase, sale, adjustment' })
  type: 'purchase' | 'sale' | 'adjustment';

  @IsOptional()
  @MaxLength(255, { message: 'Operator name must be less than 255 characters' })
  operator?: string;

  @IsOptional()
  remark?: string;
}
