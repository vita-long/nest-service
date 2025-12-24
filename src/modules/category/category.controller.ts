import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CategoryType } from '@/entities/category.entity';

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
  async findActive(
    @Query('type') type?: CategoryType,
  ) {
    return this.categoryService.findActive(type);
  }

  // 根据ID获取单个分类
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.categoryService.findById(id);
  }

  // 获取分类及其关联产品
  @Get(':id/products')
  async getCategoryWithProducts(@Param('id') id: number) {
    return this.categoryService.getCategoryWithProducts(id);
  }

  // 获取指定父分类下的子分类
  @Get('parent/:parentId')
  async findByParentId(@Param('parentId') parentId: number) {
    return this.categoryService.findByParentId(parentId);
  }

  // 创建新分类（需要认证）
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // 更新分类（需要认证）
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // 删除分类（需要认证）
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number) {
    await this.categoryService.remove(id);
    return { message: 'Category deleted successfully' };
  }
}