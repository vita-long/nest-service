import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from '../category/category.service';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private categoryService: CategoryService
  ) {}

  // 生成自定义产品ID
  private generateProductId(): string {
    const machineId = process.env.MACHINE_ID || '0';
    const randomId = uuidv7();
    return `${machineId}prod_${randomId}`;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 验证分类是否存在
    await this.categoryService.findById(createProductDto.categoryId);

    const product = this.productRepository.create({
      ...createProductDto,
      productId: this.generateProductId(),
      stock: createProductDto.stock || 0,
      sales: createProductDto.sales || 0,
      images: createProductDto.images || [],
    });
    return this.productRepository.save(product);
  }
  // 查询所有商品（带分页）
  async findAll(limit?: number, offset?: number): Promise<{ list: Product[], total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    const [items, totalCount] = await query
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list: items, total: totalCount };
  }
  // 查询激活的商品（带分页）
  async findActive(limit?: number, offset?: number): Promise<{ list: Product[], total: number }> {
    const query = this.productRepository.createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    const [items, totalCount] = await query
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list: items, total: totalCount };
  }

  async findById(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productId },
      relations: ['category'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product!;
  }

  async update(productId: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // 检查产品是否存在
    await this.findById(productId);
    
    // 如果更新分类ID，验证分类是否存在
    if (updateProductDto.categoryId) {
      await this.categoryService.findById(updateProductDto.categoryId);
    }

    await this.productRepository.update({ productId }, updateProductDto);
    return this.findById(productId);
  }

  async remove(productId: string): Promise<void> {
    // 检查产品是否存在
    await this.findById(productId);
    
    const result = await this.productRepository.delete({ productId });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }

  async findByCategory(categoryId: string, limit?: number, offset?: number): Promise<{ list: Product[], total: number }> {
    // 验证分类是否存在
    await this.categoryService.findById(categoryId);

    const query = this.productRepository.createQueryBuilder('product')
      .where('product.categoryId = :categoryId', { categoryId })
      .leftJoinAndSelect('product.category', 'category');
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    const [items, totalCount] = await query.orderBy('product.createdAt', 'DESC').getManyAndCount();
    
    return { list: items, total: totalCount };
  }

  async findNewProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { isNew: true, isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findRecommendedProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { isRecommend: true, isActive: true },
      relations: ['category'],
      order: { sales: 'DESC' },
      take: limit,
    });
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    const product = await this.findById(productId);
    const newStock = product.stock + quantity;
    
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }
    
    await this.productRepository.update({ productId }, { stock: newStock });
  }

  async updateSales(productId: string, quantity: number): Promise<void> {
    const product = await this.findById(productId);
    await this.productRepository.update({ productId }, { sales: product.sales + quantity });
  }
}