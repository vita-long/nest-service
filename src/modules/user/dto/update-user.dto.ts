import { IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  status?: boolean;

  @IsOptional()
  lastLoginTime?: Date;

  @IsOptional()
  lastLoginIp?: string;
}