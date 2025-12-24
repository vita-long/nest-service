import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      isActive: createCategoryDto.isActive ?? true,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findActive(type?: CategoryType): Promise<Category[]> {
    const where = { isActive: true };
    if (type !== undefined) {
      Object.assign(where, { type });
    }

    return this.categoryRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findById(id);

    // 不允许将分类设置为其自身的子分类
    if (updateCategoryDto.parentId === category.id) {
      throw new Error('A category cannot be set as its own child');
    }

    await this.categoryRepository.update({ id }, updateCategoryDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    // 检查分类是否存在
    await this.findById(id);

    const result = await this.categoryRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async findByParentId(parentId?: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId },
      order: { sortOrder: 'ASC' },
    });
  }

  async getCategoryWithProducts(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }
}
