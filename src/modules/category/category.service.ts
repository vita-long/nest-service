import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class CategoryService {
  constructor(@InjectRepository(Category) private categoryRepository: Repository<Category>) {}

  // 生成自定义分类ID
  private generateCategoryId(): string {
    const machineId = process.env.MACHINE_ID || '0';
    const randomId = uuidv7();
    return `${machineId}C${randomId}`;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      categoryId: this.generateCategoryId(),
      isActive: createCategoryDto.isActive ?? true,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    return category!;
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(categoryId);
    
    // 不允许将分类设置为其自身的子分类
    if (updateCategoryDto.parentId === categoryId) {
      throw new Error('A category cannot be set as its own child');
    }

    await this.categoryRepository.update({ categoryId }, updateCategoryDto);
    return this.findById(categoryId);
  }

  async remove(categoryId: string): Promise<void> {
    // 检查分类是否存在
    await this.findById(categoryId);
    
    const result = await this.categoryRepository.delete({ categoryId });
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
  }

  async findByParentId(parentId?: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId },
      order: { sortOrder: 'ASC' },
    });
  }

  async getCategoryWithProducts(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { categoryId },
      relations: ['products'],
    });
  }
}