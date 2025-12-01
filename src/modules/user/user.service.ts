import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  // 生成自定义用户ID
  private generateUserId(): string {
    // userId前缀
    const machineId = process.env.MACHINE_ID || 0;
    const randomId = uuidv7();
    return `${machineId}${randomId}`;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      userId: this.generateUserId(), // 自定义生成用户ID
    });
    return this.userRepository.save(user);
  }

  async findAllUser(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find();
    // Remove password from response
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async findById(userId: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    const updateData: any = { ...updateUserDto };
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.userRepository.update({ userId }, updateData);
    const updatedUser = await this.userRepository.findOneBy({ userId });
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(userId: string): Promise<void> {
    const result = await this.userRepository.delete({ userId });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  // Add method for auth service to find user with password
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }
}