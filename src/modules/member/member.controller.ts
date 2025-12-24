import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import { MemberService } from './member.service';
import { CreateMemberLevelDto } from './dto/create-member-level.dto';
import { UpdateMemberLevelDto } from './dto/update-member-level.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { ActivateMemberDto } from './dto/activate-member.dto';

/**
 * 会员控制器
 * 提供会员等级、会员信息、积分和成长值管理的API接口
 */
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /**
   * 创建会员等级
   * @param createMemberLevelDto 创建会员等级的数据
   * @returns 创建的会员等级
   */
  @UseGuards(JwtAuthGuard)
  @Post('levels')
  createMemberLevel(@Body() createMemberLevelDto: CreateMemberLevelDto) {
    return this.memberService.createMemberLevel(createMemberLevelDto);
  }

  /**
   * 获取所有会员等级
   * @returns 会员等级列表
   */
  @UseGuards(JwtAuthGuard)
  @Get('levels')
  getAllMemberLevels() {
    return this.memberService.getAllMemberLevels();
  }

  /**
   * 更新会员等级
   * @param id 会员等级ID
   * @param updateMemberLevelDto 更新会员等级的数据
   * @returns 更新后的会员等级
   */
  @UseGuards(JwtAuthGuard)
  @Patch('levels/:id')
  updateMemberLevel(
    @Param('id') id: number,
    @Body() updateMemberLevelDto: UpdateMemberLevelDto,
  ) {
    return this.memberService.updateMemberLevel(id, updateMemberLevelDto);
  }

  /**
   * 删除会员等级
   * @param id 会员等级ID
   */
  @UseGuards(JwtAuthGuard)
  @Delete('levels/:id')
  deleteMemberLevel(@Param('id') id: number) {
    return this.memberService.deleteMemberLevel(id);
  }

  /**
   * 获取所有会员信息（分页）
   * @param page 页码
   * @param limit 每页数量
   * @returns 会员信息列表和总数
   */
  @UseGuards(JwtAuthGuard)
  @Get('list')
  getMemberInfoList(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.memberService.getMemberInfo(
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  /**
   * 获取当前用户的会员信息
   * @param req 请求对象，包含用户信息
   * @returns 会员信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('info/me')
  getCurrentMemberInfo(@Request() req) {
    return this.memberService.getMemberInfoById(req.user.id);
  }

  /**
   * 调整会员积分
   * @param adjustPointsDto 调整积分的数据
   * @returns 更新后的会员信息
   */
  @UseGuards(JwtAuthGuard)
  @Post('points/adjust')
  adjustPoints(@Body() adjustPointsDto: AdjustPointsDto) {
    return this.memberService.adjustPoints(adjustPointsDto);
  }

  /**
   * 调整会员状态
   * @param userId 用户ID
   * @param active 是否激活会员状态
   * @returns 更新后的会员信息
   */
  @UseGuards(JwtAuthGuard)
  @Post('status/activate')
  activateMember(@Body() activateMemberDto: ActivateMemberDto) {
    return this.memberService.activateMember(activateMemberDto);
  }

  /**
   * 获取当前用户的积分历史记录
   * @param req 请求对象，包含用户信息
   * @param page 页码
   * @param limit 每页数量
   * @returns 积分历史记录列表和总数
   */
  @UseGuards(JwtAuthGuard)
  @Get('points/history')
  getPointsHistory(
    @Request() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.memberService.getPointsHistory(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  /**
   * 订阅会员服务
   * @param req 请求对象，包含用户信息
   * @param levelId 会员等级ID
   * @returns 会员订阅信息
   */
  @UseGuards(JwtAuthGuard)
  @Post('subscribe/:levelId')
  subscribeMember(@Request() req, @Param('levelId') levelId: number) {
    return this.memberService.subscribeMember(req.user.id, levelId);
  }

  /**
   * 获取当前用户的会员订阅记录
   * @param req 请求对象，包含用户信息
   * @param page 页码
   * @param limit 每页数量
   * @returns 会员订阅记录列表和总数
   */
  @UseGuards(JwtAuthGuard)
  @Get('subscriptions')
  getMemberSubscriptions(
    @Request() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.memberService.getMemberSubscriptions(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }
}
