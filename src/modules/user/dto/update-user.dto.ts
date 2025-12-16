import { IsEmail, MinLength, IsOptional, Length } from 'class-validator';

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

  @IsOptional()
  @Length(1, 255, { message: 'Nickname must be between 1 and 255 characters' })
  nickname?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  @Length(0, 500, { message: 'Bio must be less than 500 characters' })
  bio?: string;

  @IsOptional()
  phone?: string;
}