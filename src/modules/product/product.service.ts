import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CategoryService } from '../category/category.service';
import { uuidv7 } from 'uuidv7';
import { StockHistory } from '../../entities/stock-history.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(StockHistory)
    private stockHistoryRepository: Repository<StockHistory>,
    private categoryService: CategoryService,
  ) {}

  // 不再需要生成自定义产品ID，使用自增ID

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 验证分类是否存在
    await this.categoryService.findById(createProductDto.categoryId);

    const product = this.productRepository.create({
      ...createProductDto,
      stock: createProductDto.stock || 0,
      sales: createProductDto.sales || 0,
      images: createProductDto.images || [],
    });
    return this.productRepository.save(product);
  }
  // 查询所有商品（带分页）
  async findAll(
    limit?: number,
    offset?: number,
    productType?: ProductType,
  ): Promise<{ list: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');

    if (productType) {
      query.where('product.productType = :productType', { productType });
    }

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
  async findActive(
    limit?: number,
    offset?: number,
  ): Promise<{ list: Product[]; total: number }> {
    const query = this.productRepository
      .createQueryBuilder('product')
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

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // 检查产品是否存在
    await this.findById(id);

    // 如果更新分类ID，验证分类是否存在
    if (updateProductDto.categoryId) {
      await this.categoryService.findById(updateProductDto.categoryId);
    }

    await this.productRepository.update({ id }, updateProductDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    // 检查产品是否存在
    await this.findById(id);

    const result = await this.productRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async findByCategory(
    categoryId: number,
    limit?: number,
    offset?: number,
  ): Promise<{ list: Product[]; total: number }> {
    // 验证分类是否存在
    await this.categoryService.findById(categoryId);

    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.categoryId = :categoryId', { categoryId })
      .leftJoinAndSelect('product.category', 'category');

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }

    const [items, totalCount] = await query
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();

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

  async updateStock(
    productId: number,
    quantity: number,
    type: 'purchase' | 'sale' | 'adjustment' = 'adjustment',
    operator?: string,
    remark?: string,
    manager?: any, // 接受可选的manager参数，用于在事务内部使用
  ): Promise<void> {
    // 根据是否提供了manager参数选择使用事务内的manager还是默认的repository
    const productRepository =
      manager?.getRepository(Product) || this.productRepository;
    const stockHistoryRepository =
      manager?.getRepository(StockHistory) || this.stockHistoryRepository;

    // 查找产品
    const product = await productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    // 更新库存
    await productRepository.update({ id: productId }, { stock: newStock });

    // 记录库存历史
    const stockHistory = stockHistoryRepository.create({
      productId: product.id,
      previousStock: product.stock,
      changeQuantity: quantity,
      currentStock: newStock,
      type,
      operator,
      remark,
    });

    await stockHistoryRepository.save(stockHistory);
  }

  async adjustStock(
    productId: number,
    adjustStockDto: AdjustStockDto,
    manager?: any,
  ): Promise<void> {
    const { changeQuantity, type, operator, remark } = adjustStockDto;
    await this.updateStock(
      productId,
      changeQuantity,
      type,
      operator,
      remark,
      manager,
    );
  }

  async getStockHistory(
    productId: number,
    limit?: number,
    offset?: number,
  ): Promise<{ list: StockHistory[]; total: number }> {
    // 验证产品是否存在
    await this.findById(productId);

    const query = this.stockHistoryRepository
      .createQueryBuilder('stockHistory')
      .where('stockHistory.productId = :productId', { productId })
      .leftJoinAndSelect('stockHistory.product', 'product');

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }

    const [items, totalCount] = await query
      .orderBy('stockHistory.createdAt', 'DESC')
      .getManyAndCount();

    return { list: items, total: totalCount };
  }

  async getLowStockProducts(
    threshold: number = 10,
    limit?: number,
    offset?: number,
  ): Promise<{ list: Product[]; total: number }> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold })
      .leftJoinAndSelect('product.category', 'category');

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }

    const [items, totalCount] = await query
      .orderBy('product.stock', 'ASC')
      .getManyAndCount();

    return { list: items, total: totalCount };
  }

  /**
   * 查询积分商品
   * @param isActive 是否只查询激活的商品
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 积分商品列表和总数
   */
  async findPointsProducts(
    isActive?: boolean,
    limit?: number,
    offset?: number,
  ): Promise<{ list: Product[]; total: number }> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.productType = :productType', {
        productType: ProductType.Points,
      })
      .leftJoinAndSelect('product.category', 'category');

    if (isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive });
    }

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }

    const [items, totalCount] = await query
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();

    return { list: items, total: totalCount };
  }

  async updateSales(productId: number, quantity: number): Promise<void> {
    const product = await this.findById(productId);
    await this.productRepository.update(
      { id: productId },
      { sales: product.sales + quantity },
    );

    // 记录销售库存变化
    await this.updateStock(
      productId,
      -quantity,
      'sale',
      undefined,
      `Sale of ${quantity} units`,
    );
  }
}
