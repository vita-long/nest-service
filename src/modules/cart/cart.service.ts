import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from '../../entities/cart.entity';
import {
  CreateCartDto,
  UpdateCartDto,
  BatchUpdateCartDto,
} from './dto/cart.dto';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';

/**
 * 购物车列表项类型
 * 将product属性平铺到外层，与cart属性同级
 */
export type CartListItem = Omit<Cart, 'product'> & {
  productId: number;
  productName: string;
  mainImage: string | undefined;
  images: string[] | undefined;
  basePrice: number;
};

/**
 * 购物车服务类
 * 实现购物车的所有业务逻辑
 */
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  /**
   * 添加商品到购物车
   * @param userId 用户ID
   * @param createCartDto 创建购物车的数据传输对象
   * @returns 创建的购物车对象，product属性已平铺到外层
   */
  async addToCart(
    userId: number,
    createCartDto: CreateCartDto,
  ): Promise<CartListItem> {
    // 验证用户是否存在
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`用户不存在`);
    }

    // 验证商品是否存在
    const product = await this.productRepository.findOneBy({
      id: createCartDto.id,
    });
    if (!product) {
      throw new NotFoundException(`商品不存在`);
    }

    // 检查购物车中是否已存在该商品
    const existingCart = await this.cartRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: createCartDto.id },
      },
    });

    let savedCart: Cart;
    if (existingCart) {
      // 如果已存在，更新数量
      existingCart.quantity += createCartDto.quantity || 1;
      existingCart.specifications =
        createCartDto.specifications || existingCart.specifications;
      existingCart.isSelected =
        createCartDto.isSelected || existingCart.isSelected;
      existingCart.price = createCartDto.price || product.price;
      savedCart = await this.cartRepository.save(existingCart);
    } else {
      // 如果不存在，创建新的购物车记录
      const cart = this.cartRepository.create({
        user,
        product,
        quantity: createCartDto.quantity || 1,
        specifications: createCartDto.specifications,
        isSelected: createCartDto.isSelected || true,
        price: createCartDto.price || product.price,
      });
      savedCart = await this.cartRepository.save(cart);
    }

    // 获取完整的购物车信息（包含product关联）
    const fullCart = await this.cartRepository.findOne({
      where: { id: savedCart.id },
      relations: ['product'],
    });

    if (!fullCart) {
      throw new NotFoundException(`购物车商品不存在`);
    }

    // 将product属性平铺到外层
    const { product: cartProduct, ...cartData } = fullCart;
    return {
      ...cartData,
      productId: cartProduct.id,
      productName: cartProduct.name,
      mainImage: cartProduct.mainImage,
      images: cartProduct.images,
      basePrice: cartProduct.basePrice,
    };
  }

  /**
   * 获取用户购物车列表
   * @param userId 用户ID
   * @returns 购物车列表，product属性已平铺到外层
   */
  async getCartList(userId: number): Promise<CartListItem[]> {
    // 验证用户是否存在
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`用户不存在`);
    }

    // 获取购物车数据，包含product关联
    const carts = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { updatedAt: 'DESC' },
    });

    // 将product属性平铺到外层
    return carts.map((cart) => {
      const { product: cartProduct, ...cartData } = cart;
      return {
        ...cartData,
        productId: cartProduct.id,
        productName: cartProduct.name,
        mainImage: cartProduct.mainImage,
        images: cartProduct.images,
        basePrice: cartProduct.basePrice,
      };
    });
  }

  /**
   * 更新购物车商品
   * @param userId 用户ID
   * @param cartId 购物车ID
   * @param updateCartDto 更新购物车的数据传输对象
   * @returns 更新后的购物车对象，product属性已平铺到外层
   */
  async updateCart(
    userId: number,
    cartId: number,
    updateCartDto: UpdateCartDto,
  ): Promise<CartListItem> {
    // 验证购物车是否存在且属于该用户
    let cart = await this.cartRepository.findOne({
      where: {
        id: cartId,
        user: { id: userId },
      },
    });

    if (!cart) {
      throw new NotFoundException(`购物车商品不存在`);
    }

    // 更新购物车信息
    const updatedCart = await this.cartRepository.update(cartId, updateCartDto);
    if (updatedCart.affected === 0) {
      throw new BadRequestException(`更新购物车商品失败`);
    }

    // 重新获取更新后的购物车信息
    cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['product'],
    });

    if (!cart) {
      throw new NotFoundException(`购物车商品不存在`);
    }

    // 将product属性平铺到外层
    const { product: cartProduct, ...cartData } = cart;
    return {
      ...cartData,
      productId: cartProduct.id,
      productName: cartProduct.name,
      mainImage: cartProduct.mainImage,
      images: cartProduct.images,
      basePrice: cartProduct.basePrice,
    };
  }

  /**
   * 批量更新购物车商品
   * @param userId 用户ID
   * @param batchUpdateCartDto 批量更新购物车的数据传输对象
   * @returns 更新结果
   */
  async batchUpdateCart(
    userId: number,
    batchUpdateCartDto: BatchUpdateCartDto,
  ): Promise<{ success: boolean; message: string }> {
    // 验证购物车是否存在且属于该用户
    const carts = await this.cartRepository.find({
      where: {
        id: In(batchUpdateCartDto.cartIds),
        user: { id: userId },
      },
    });

    if (carts.length !== batchUpdateCartDto.cartIds.length) {
      throw new NotFoundException(`部分购物车商品不存在`);
    }

    // 批量更新购物车信息
    const updateResult = await this.cartRepository.update(
      { id: In(batchUpdateCartDto.cartIds) },
      { isSelected: batchUpdateCartDto.isSelected },
    );

    if (updateResult.affected === 0) {
      throw new BadRequestException(`批量更新购物车商品失败`);
    }

    return {
      success: true,
      message: `成功更新 ${updateResult.affected} 个购物车商品`,
    };
  }

  /**
   * 删除购物车商品
   * @param userId 用户ID
   * @param cartId 购物车ID
   * @returns 删除结果
   */
  async removeCart(
    userId: number,
    cartId: number,
  ): Promise<{ success: boolean; message: string }> {
    // 验证购物车是否存在且属于该用户
    const cart = await this.cartRepository.findOne({
      where: {
        id: cartId,
        user: { id: userId },
      },
    });

    if (!cart) {
      throw new NotFoundException(`购物车商品不存在`);
    }

    // 删除购物车商品
    const deleteResult = await this.cartRepository.delete(cartId);
    if (deleteResult.affected === 0) {
      throw new BadRequestException(`删除购物车商品失败`);
    }

    return { success: true, message: `成功删除购物车商品` };
  }

  /**
   * 清空购物车
   * @param userId 用户ID
   * @returns 清空结果
   */
  async clearCart(
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    // 验证用户是否存在
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`用户不存在`);
    }

    // 清空购物车
    const deleteResult = await this.cartRepository.delete({
      user: { id: userId },
    });
    if (deleteResult.affected === 0) {
      throw new BadRequestException(`清空购物车失败`);
    }

    return { success: true, message: `成功清空购物车` };
  }
}
