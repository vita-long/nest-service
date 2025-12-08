import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 获取所有产品（需要认证）
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    // 如果提供了limit和offset，优先使用它们；否则根据page和pageSize计算
    const finalLimit = limit || pageSize;
    const finalOffset = offset !== undefined ? offset : (page - 1) * pageSize;
    
    const result = await this.productService.findAll(finalLimit, finalOffset);
    
    return {
      list: result.list,
      total: result.total,
      page: page,
      pageSize: pageSize
    };
  }

  // 获取所有激活的产品（公开接口）
  @Get('active')
  async findActive(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    const finalLimit = limit || pageSize;
    const finalOffset = offset !== undefined ? offset : (page - 1) * pageSize;
    
    const result = await this.productService.findActive(finalLimit, finalOffset);
    
    return {
      list: result.list,
      total: result.total,
      page: page,
      pageSize: pageSize
    };
  }

  // 根据ID获取单个产品
  @Get(':productId')
  async findOne(@Param('productId') productId: string) {
    return this.productService.findById(productId);
  }

  // 根据分类获取产品
  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    const finalLimit = limit || pageSize;
    const finalOffset = offset !== undefined ? offset : (page - 1) * pageSize;
    
    const result = await this.productService.findByCategory(categoryId, finalLimit, finalOffset);
    
    return {
      list: result.list,
      total: result.total,
      page: page,
      pageSize: pageSize
    };
  }

  // 获取新品推荐
  @Get('featured/new')
  async findNewProducts(@Query('limit') limit?: number) {
    return this.productService.findNewProducts(limit);
  }

  // 获取推荐产品
  @Get('featured/recommended')
  async findRecommendedProducts(@Query('limit') limit?: number) {
    return this.productService.findRecommendedProducts(limit);
  }

  // 创建新产品（需要认证）
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  // 更新产品（需要认证）
  @Put(':productId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productService.update(productId, updateProductDto);
  }

  // 更新产品库存（需要认证）
  @Put(':productId/stock')
  @UseGuards(JwtAuthGuard)
  async updateStock(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number
  ) {
    await this.productService.updateStock(productId, quantity);
    return { message: 'Stock updated successfully' };
  }

  // 更新产品销量（需要认证）
  @Put(':productId/sales')
  @UseGuards(JwtAuthGuard)
  async updateSales(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number
  ) {
    await this.productService.updateSales(productId, quantity);
    return { message: 'Sales updated successfully' };
  }

  // 删除产品（需要认证）
  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('productId') productId: string) {
    await this.productService.remove(productId);
    return { message: 'Product deleted successfully' };
  }
}