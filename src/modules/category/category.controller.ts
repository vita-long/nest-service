import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 获取所有分类（需要认证）
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.categoryService.findAll();
  }

  // 获取所有激活的分类（公开接口）
  @Get('active')
  async findActive() {
    return this.categoryService.findActive();
  }

  // 根据ID获取单个分类
  @Get(':categoryId')
  async findOne(@Param('categoryId') categoryId: string) {
    return this.categoryService.findById(categoryId);
  }

  // 获取分类及其关联产品
  @Get(':categoryId/products')
  async getCategoryWithProducts(@Param('categoryId') categoryId: string) {
    return this.categoryService.getCategoryWithProducts(categoryId);
  }

  // 获取指定父分类下的子分类
  @Get('parent/:parentId')
  async findByParentId(@Param('parentId') parentId: string) {
    return this.categoryService.findByParentId(parentId);
  }

  // 创建新分类（需要认证）
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // 更新分类（需要认证）
  @Put(':categoryId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto);
  }

  // 删除分类（需要认证）
  @Delete(':categoryId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('categoryId') categoryId: string) {
    await this.categoryService.remove(categoryId);
    return { message: 'Category deleted successfully' };
  }
}