import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Controller('paymentMethods')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 创建支付方式
   * POST /api/payment-methods
   */
  @Post()
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    try {
      const paymentMethod = await this.paymentService.create(createPaymentMethodDto);
      return paymentMethod;
    } catch (error) {
      throw new HttpException(
        error.message || '创建支付方式失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取所有支付方式
   * GET /api/payment-methods
   */
  @Get()
  async findAll() {
    try {
      const paymentMethods = await this.paymentService.findAll();
      return paymentMethods;
    } catch (error) {
      throw new HttpException(
        error.message || '获取支付方式列表失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取启用的支付方式
   * GET /api/payment-methods/enabled
   */
  @Get('enabled')
  async findEnabled() {
    try {
      const paymentMethods = await this.paymentService.findEnabled();
      return {
        code: HttpStatus.OK,
        message: '获取启用的支付方式列表成功',
        data: paymentMethods,
      };
    } catch (error) {
      throw new HttpException(
        error.message || '获取启用的支付方式列表失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 根据ID获取支付方式
   * GET /api/payment-methods/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      const paymentMethod = await this.paymentService.findById(+id);
      return paymentMethod;
    } catch (error) {
      throw new HttpException(
        error.message || '获取支付方式详情失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 根据代码获取支付方式
   * GET /api/payment-methods/code/:code
   */
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    try {
      const paymentMethod = await this.paymentService.findByCode(code);
      return paymentMethod;
    } catch (error) {
      throw new HttpException(
        error.message || '获取支付方式详情失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新支付方式
   * PUT /api/payment-methods/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto) {
    try {
      const paymentMethod = await this.paymentService.update(+id, updatePaymentMethodDto);
      return paymentMethod;
    } catch (error) {
      throw new HttpException(
        error.message || '更新支付方式失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 启用支付方式
   * PUT /api/payment-methods/:id/enable
   */
  @Put(':id/enable')
  async enable(@Param('id') id: string) {
    try {
      const paymentMethod = await this.paymentService.toggleStatus(+id, true);
      return paymentMethod;
    } catch (error) {
      throw new HttpException(
        error.message || '启用支付方式失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 禁用支付方式
   * PUT /api/payment-methods/:id/disable
   */
  @Put(':id/disable')
  async disable(@Param('id') id: string) {
    try {
      const paymentMethod = await this.paymentService.toggleStatus(+id, false);
      return paymentMethod;
    } catch (error) {
      throw new HttpException(
        error.message || '禁用支付方式失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除支付方式
   * DELETE /api/payment-methods/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.paymentService.remove(+id);
      return {
        message: '删除支付方式成功',
      };
    } catch (error) {
      throw new HttpException(
        error.message || '删除支付方式失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
