import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'OpenID must be a string' })
  openid?: string;

  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  role?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'Nickname must be a string' })
  nickname?: string;
}
