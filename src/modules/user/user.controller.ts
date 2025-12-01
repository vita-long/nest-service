import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllUser() {
    const users = await this.userService.findAllUser();
    return users;
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async findOneUser(@Param('userId') userId: string) {
    const user = await this.userService.findById(userId);
    return user;
  }

  @Put(':userId')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(userId, updateUserDto);
    return updatedUser;
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async removeUser(@Param('userId') userId: string) {
    await this.userService.remove(userId);
    return null;
  }
}