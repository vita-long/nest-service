import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto, UpdateCartDto, BatchUpdateCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

/**
 * 购物车控制器类
 * 提供购物车相关的REST API接口
 */
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * 添加商品到购物车（需要认证）
   * @param req 请求对象，包含用户信息
   * @param createCartDto 创建购物车的数据传输对象
   * @returns 创建的购物车对象
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async addToCart(@Request() req, @Body() createCartDto: CreateCartDto) {
    // 从请求中获取用户ID
    const userId = req.user.id;
    return this.cartService.addToCart(userId, createCartDto);
  }

  /**
   * 获取用户购物车列表（需要认证）
   * @param req 请求对象，包含用户信息
   * @returns 购物车列表
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCartList(@Request() req) {
    // 从请求中获取用户ID
    const userId = req.user.id;
    const cartList = await this.cartService.getCartList(userId);
    console.log(cartList);
    return cartList;
  }

  /**
   * 更新购物车商品（需要认证）
   * @param req 请求对象，包含用户信息
   * @param cartId 购物车ID
   * @param updateCartDto 更新购物车的数据传输对象
   * @returns 更新后的购物车对象
   */
  @Put(':cartId')
  @UseGuards(JwtAuthGuard)
  async updateCart(@Request() req, @Param('cartId') cartId: number, @Body() updateCartDto: UpdateCartDto) {
    // 从请求中获取用户ID
    const userId = req.user.id;
    return this.cartService.updateCart(userId, cartId, updateCartDto);
  }

  /**
   * 批量更新购物车商品（需要认证）
   * @param req 请求对象，包含用户信息
   * @param batchUpdateCartDto 批量更新购物车的数据传输对象
   * @returns 更新结果
   */
  @Put('batch')
  @UseGuards(JwtAuthGuard)
  async batchUpdateCart(@Request() req, @Body() batchUpdateCartDto: BatchUpdateCartDto) {
    // 从请求中获取用户ID
    const userId = req.user.id;
    return this.cartService.batchUpdateCart(userId, batchUpdateCartDto);
  }

  /**
   * 删除购物车商品（需要认证）
   * @param req 请求对象，包含用户信息
   * @param cartId 购物车ID
   * @returns 删除结果
   */
  @Delete(':cartId')
  @UseGuards(JwtAuthGuard)
  async removeCart(@Request() req, @Param('cartId') cartId: number) {
    // 从请求中获取用户ID
    const userId = req.user.id;
    return this.cartService.removeCart(userId, cartId);
  }

  /**
   * 清空购物车（需要认证）
   * @param req 请求对象，包含用户信息
   * @returns 清空结果
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearCart(@Request() req) {
    // 从请求中获取用户ID
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
  }
}
