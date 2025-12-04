import { Controller, Post, Get, Delete, Param, UploadedFile, UploadedFiles, Query, Body, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, UseGuards } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetCurrentUser } from '@/common/decorators/get-current-user.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 单个文件上传
   * @param file 上传的文件
   * @param type 文件类型（用于区分不同的上传功能）
   * @returns 上传结果
   */
  @Post('single')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
        fileIsRequired: true,
      })
    ) file: Express.Multer.File,
    @GetCurrentUser('userId') userId: string,
    @Body('type') bodyType?: string
  ) {
    // 优先从查询参数获取type，如果没有则从请求体获取，最后使用默认值
    const type = bodyType;
    
    // 使用默认值'default'
    const uploadType = (type || 'default') as 'default' | 'image' | 'document' | 'audio' | 'video';
    const result = await this.uploadService.handleSingleUpload(file, uploadType, userId);
    
    // 添加访问URL
    result['url'] = this.uploadService.getFileUrl(result.filename, uploadType);
    
    return result;
  }

  /**
   * 批量文件上传
   * @param files 上传的文件数组
   * @param type 文件类型（用于区分不同的上传功能）
   * @param limit 最大文件数量限制（可选）
   * @returns 上传结果
   */
  @Post('batch')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10)) // 默认限制10个文件
  async uploadBatchFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB 每个文件
        ],
        fileIsRequired: true,
      })
    ) files: Array<Express.Multer.File>,
    @GetCurrentUser('userId') userId: string,
    @Body('type') bodyType?: string,
    @Query('limit') limit?: string
  ) {
    // 优先从查询参数获取type，如果没有则从请求体获取
    const type = bodyType;
    // 如果提供了limit参数，检查是否超过限制
    const maxFiles = limit ? parseInt(limit, 10) : 10;
    if (files.length > maxFiles) {
      return {
        status: 'error',
        message: `文件数量超过限制。最大允许上传 ${maxFiles} 个文件`,
        data: null,
      };
    }

    // 使用默认值'default'
    const uploadType = (type || 'default') as 'default' | 'image' | 'document' | 'audio' | 'video';
    console.log('batch upload type:', uploadType);
    const result = await this.uploadService.handleBatchUpload(files, uploadType, userId);
    
    // 为成功上传的文件添加访问URL
    if (result.data) {
      result.data = result.data.map(file => ({
        ...file,
        url: this.uploadService.getFileUrl(file.filename, uploadType),
      }));
    }

    return {
      status: result.success ? 'success' : 'partial',
      message: result.success 
        ? `成功上传 ${result.data?.length || 0} 个文件`
        : `部分文件上传失败。成功: ${result.data?.length || 0}, 失败: ${result.errors?.length || 0}`,
      data: result,
    };
  }

  /**
   * 分页查询图片列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 图片列表和分页信息
   */
  @Get('images')
  async getImages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    // 转换参数为数字
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // 调用服务层方法获取图片列表
    const result = await this.uploadService.getImages(pageNum, limitNum);
    
    return result;
  }

  /**
   * 删除文件
   * @param resourceId 文件资源ID
   * @returns 删除结果
   */
  @Delete('file/:resourceId')
  async deleteFile(@Param('resourceId') resourceId: string) {
    return await this.uploadService.deleteFile(resourceId);
  }

  /**
   * 批量删除文件
   * @param body 请求体，包含resourceIds数组
   * @returns 批量删除结果
   */
  @Delete('files/batch')
  async batchDeleteFiles(@Body() body: { resourceIds: string[] }) {
    return await this.uploadService.batchDeleteFiles(body.resourceIds);
  }

}