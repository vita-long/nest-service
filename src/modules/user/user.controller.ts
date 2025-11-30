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
    const users = await this.userService.findAll();
    return users;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOneUser(@Param('id') id: number) {
    const user = await this.userService.findById(Number(id));
    return user;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(Number(id), updateUserDto);
    return updatedUser;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeUser(@Param('id') id: number) {
    await this.userService.remove(Number(id));
    return null;
  }
}