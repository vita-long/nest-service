import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetCurrentUser } from '@/common/decorators/get-current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllUser() {
    const users = await this.userService.findAllUser();
    return users;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOneUser(@Param('id') id: number) {
    const user = await this.userService.findById(id);
    return user;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return updatedUser;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeUser(@Param('id') id: number) {
    await this.userService.remove(id);
    return null;
  }

  /**
   * 获取当前登录用户的个人信息
   * @param user 当前登录用户信息
   * @returns 用户个人信息
   */
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserProfile(@GetCurrentUser() user) {
    return this.userService.findById(user.id);
  }

  /**
   * 更新当前登录用户的个人信息
   * @param user 当前登录用户信息
   * @param updateUserDto 更新的用户信息
   * @returns 更新后的用户信息
   */
  @Put('profile/me')
  @UseGuards(JwtAuthGuard)
  async updateCurrentUserProfile(
    @GetCurrentUser() user,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }
}
