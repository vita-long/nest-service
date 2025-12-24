import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { IssueCouponDto } from './dto/issue-coupon.dto';
import { CouponStatus, CouponType } from '../../entities/coupons.entity';
import { CouponUseStatus } from '../../entities/coupon_receive_records.entity';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

/**
 * 优惠券控制器类
 * 提供优惠券相关的REST API接口
 */
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * 创建优惠券（需要认证）
   * @param createCouponDto 创建优惠券的数据传输对象
   * @returns 创建的优惠券对象
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  /**
   * 获取优惠券列表（需要认证）
   * @param page 页码
   * @param pageSize 每页数量
   * @param limit 限制数量
   * @param offset 偏移量
   * @param status 优惠券状态
   * @param type 优惠券类型
   * @returns 优惠券列表和分页信息
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('status') status?: CouponStatus,
    @Query('type') type?: CouponType,
    @Query('code') code?: string,
    @Query('name') name?: string,
  ) {
    // 如果提供了limit和offset，优先使用它们；否则根据page和pageSize计算
    const finalLimit = limit || pageSize;
    const finalOffset = offset !== undefined ? offset : (page - 1) * pageSize;

    const result = await this.couponService.findAll({
      limit: finalLimit,
      offset: finalOffset,
      status,
      type,
      code,
      name,
    });

    return {
      list: result.list,
      total: result.total,
      page: page,
      pageSize: pageSize,
    };
  }

  /**
   * 根据ID获取优惠券详情（需要认证）
   * @param id 优惠券ID
   * @returns 优惠券对象
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    return this.couponService.findById(id);
  }

  /**
   * 根据优惠券码检查优惠券是否可用（公开接口）
   * @param code 优惠券码
   * @returns 优惠券对象
   */
  @Get('check/:code')
  async checkCoupon(@Param('code') code: string) {
    return this.couponService.checkCoupon(code);
  }

  /**
   * 更新优惠券（需要认证）
   * @param id 优惠券ID
   * @param updateCouponDto 更新优惠券的数据传输对象
   * @returns 更新后的优惠券对象
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, updateCouponDto);
  }

  /**
   * 删除优惠券（需要认证）
   * @param id 优惠券ID
   * @returns 删除结果
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number) {
    await this.couponService.remove(id);
    return { message: '优惠券删除成功' };
  }

  /**
   * 发放优惠券（需要认证）
   * @param issueCouponDto 发放优惠券的数据传输对象
   * @returns 发放结果
   */
  @Post('issue')
  @UseGuards(JwtAuthGuard)
  async issueCoupon(@Body() issueCouponDto: IssueCouponDto) {
    return this.couponService.issueCoupon(issueCouponDto);
  }

  /**
   * 查询用户领取的优惠券（需要认证）
   * @param userId 用户ID
   * @param status 优惠券使用状态（可选）
   * @returns 用户领取的优惠券列表
   */
  @Get('user/list')
  @UseGuards(JwtAuthGuard)
  async findUserCoupons(
    @Query('userId') userId: number,
    @Query('status') status?: CouponUseStatus,
  ) {
    return this.couponService.findUserCoupons(userId, status);
  }
}
