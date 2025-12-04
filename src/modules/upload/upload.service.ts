import { Injectable, HttpStatus } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCode } from '@/common/types/exception';
import { Express } from 'express';
import { join, extname } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Resources } from '@/entities/resources.entity';

export interface MulterFile extends Express.Multer.File {}

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Resources)
    private resourcesRepository: Repository<Resources>,
  ) {}

  // 允许的文件类型配置
  private allowedFileTypes = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    document: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'],
    audio: ['.mp3', '.wav', '.ogg'],
    video: ['.mp4', '.avi', '.mov', '.wmv'],
    default: [], // 默认为空，允许所有类型
  };

  /**
   * 验证文件类型是否允许
   * @param file 文件对象
   * @param type 上传类型
   * @returns 是否允许
   */
  private validateFileType(file: MulterFile, type: keyof typeof this.allowedFileTypes): boolean {
    const fileExtension = extname(file.originalname).toLowerCase();
    const allowedExtensions = this.allowedFileTypes[type] || this.allowedFileTypes.default;
    
    // 如果允许的类型为空数组，则允许所有类型
    return allowedExtensions.length === 0 || allowedExtensions.some(ext => ext === fileExtension);
  }

  /**
   * 处理单个文件上传
   * @param file 文件对象
   * @param type 上传类型
   * @returns 上传结果
   */
  // 生成自定义资源ID
  private generateResourceId(): string {
    const prefixId = '210';
    return `${prefixId}${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
  }

  async handleSingleUpload(file: MulterFile, type: keyof typeof this.allowedFileTypes, userId: string): Promise<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
    mimetype: string;
    type: string;
    resourceId: string;
  }> {
    try {
      // 验证userId
      if (!userId) {
        throw new BusinessException(
          ErrorCode.UNAUTHORIZED,
          '请先登录再进行上传操作'
        );
      }
      
      // 验证文件类型
      if (type && !this.validateFileType(file, type)) {
        // 如果文件类型不允许，删除已上传的文件
        if (file.path && existsSync(file.path)) {
          unlinkSync(file.path);
        }
        const allowedTypes = this.allowedFileTypes[type as keyof typeof this.allowedFileTypes]?.join(', ') || '所有类型';
        throw new BusinessException(
          ErrorCode.FILE_TYPE_INVALID,
          `文件类型不允许上传。允许的类型: ${allowedTypes}`
        );
      }

      // 创建资源实体
      const resource = new Resources();
      resource.name = file.originalname;
      resource.originalName = file.originalname;
      resource.path = this.getFileUrl(file.filename, type);
      resource.type = type || 'default';
      resource.format = extname(file.originalname).substring(1).toLowerCase(); // 移除点号
      resource.size = file.size;
      resource.status = 1; // 默认启用
      resource.resourceId = this.generateResourceId(); // 自定义生成资源ID
      resource.mimetype = file.mimetype; // 存储MIME类型
      resource.userId = userId; // 设置上传用户ID

      // 保存到数据库
      const savedResource = await this.resourcesRepository.save(resource);

      // 返回上传结果
      return {
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        type: type || 'default',
        resourceId: savedResource.resourceId, // 返回数据库生成的ID
      };
    } catch (error) {
      // 发生错误时，尝试删除已上传的文件
      if (file.path && existsSync(file.path)) {
        try {
          unlinkSync(file.path);
        } catch (unlinkError) {
          // 记录删除失败，但不影响原始错误的抛出
          console.error('Failed to delete file after error:', unlinkError);
        }
      }
      
      // 重新抛出错误或转换为适当的HTTP异常
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        ErrorCode.FILE_UPLOAD_ERROR,
        '文件上传失败: ' + error.message,
        { originalError: error.message }
      );
    }
  }

  /**
   * 处理批量文件上传
   * @param files 文件对象数组
   * @param type 上传类型
   * @returns 上传结果数组
   */
  async handleBatchUpload(files: MulterFile[], type: keyof typeof this.allowedFileTypes, userId: string): Promise<{
    success: boolean;
    data?: Array<{
      filename: string;
      originalname: string;
      path: string;
      size: number;
      mimetype: string;
      type: string;
      resourceId: string;
    }>;
    errors?: Array<{
      originalname: string;
      error: string;
    }>;
  }> {
    const results = { 
      success: true,
      data: [] as Array<{
        filename: string;
        originalname: string;
        path: string;
        size: number;
        mimetype: string;
        type: string;
        resourceId: string;
      }>,
      errors: [] as Array<{
        originalname: string;
        error: string;
      }>
    };

    // 逐个处理文件
    for (const file of files) {
      try {
        // 验证userId
        if (!userId) {
          results.errors.push({
            originalname: file.originalname,
            error: '请先登录再进行上传操作'
          });
          results.success = false;
          continue;
        }
        
        // 验证文件类型
        if (type && !this.validateFileType(file, type)) {
          // 如果文件类型不允许，删除已上传的文件
          if (file.path && existsSync(file.path)) {
            unlinkSync(file.path);
          }
          const allowedTypes = this.allowedFileTypes[type as keyof typeof this.allowedFileTypes]?.join(', ') || '所有类型';
          results.errors.push({
            originalname: file.originalname,
            error: `文件类型不允许上传。允许的类型: ${allowedTypes}`
          });
          results.success = false;
          continue;
        }

        // 创建资源实体
      const resource = new Resources();
      resource.name = file.originalname;
      resource.originalName = file.originalname;
      resource.path = file.path;
      resource.type = type || 'default';
      resource.format = extname(file.originalname).substring(1).toLowerCase(); // 移除点号
      resource.size = file.size;
      resource.status = 1; // 默认启用
      resource.resourceId = this.generateResourceId(); // 自定义生成资源ID
      resource.mimetype = file.mimetype; // 存储MIME类型
      // userId可以在需要时设置，当前保持为null

        // 保存到数据库
        const savedResource = await this.resourcesRepository.save(resource);

        // 添加到成功列表
        results.data.push({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          type: type || 'default',
          resourceId: savedResource.resourceId, // 返回数据库生成的ID
        });
      } catch (error) {
        // 发生错误时，尝试删除已上传的文件
        if (file.path && existsSync(file.path)) {
          try {
            unlinkSync(file.path);
          } catch (unlinkError) {
            console.error('Failed to delete file after error:', unlinkError);
          }
        }

        // 添加到错误列表
        results.errors.push({
          originalname: file.originalname,
          error: error.message || '文件处理失败'
        });
        results.success = false;
      }
    }

    return results;
  }

  /**
   * 获取文件的访问URL
   * @param filename 文件名
   * @param type 文件类型目录
   * @returns 访问URL
   */
  getFileUrl(filename: string, type?: keyof typeof this.allowedFileTypes): string {
    return `http://localhost:3012/uploads/${type || 'default'}/${filename}`;
  }

  /**
   * 根据resourceId删除单个文件
   * @param resourceId 资源ID
   * @returns 是否成功
   */
  async deleteFile(resourceId: string): Promise<boolean> {
    try {
      // 先从数据库中查找资源记录
      const resource = await this.resourcesRepository.findOne({
        where: {
          resourceId: resourceId
        }
      });
      
      if (!resource) {
        throw new BusinessException(ErrorCode.FILE_NOT_FOUND, '文件不存在');
      }
      
      // 标记为已删除
      resource.status = 2;
      await this.resourcesRepository.save(resource);
      
      // 构建文件路径并删除实际文件
      const filePath = join(__dirname, '..', '..', '..', 'uploads', resource.type || 'default', resource.name);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      if (error instanceof BusinessException) {
        throw error;
      }
      return false;
    }
  }

  /**
   * 批量删除文件
   * @param resourceIds 资源ID数组
   * @returns 删除结果
   */
  async batchDeleteFiles(resourceIds: string[]): Promise<{
    success: boolean;
    deletedCount: number;
    failedIds?: string[];
    message?: string;
  }> {
    try {
      if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
        return {
          success: false,
          deletedCount: 0,
          message: '请提供有效的资源ID列表'
        };
      }

      // 查找所有资源记录
      const resources = await this.resourcesRepository.find({
        where: {
          resourceId: In(resourceIds)
        }
      });

      if (resources.length === 0) {
        return {
          success: false,
          deletedCount: 0,
          message: '未找到任何资源'
        };
      }

      // 标记为已删除
      const updatedResources = resources.map(resource => {
        resource.status = 2;
        return resource;
      });

      await this.resourcesRepository.save(updatedResources);

      // 删除实际文件
      const failedIds: string[] = [];
      for (const resource of resources) {
        try {
          const filePath = join(__dirname, '..', '..', '..', 'uploads', resource.type || 'default', resource.name);
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch (error) {
          console.error(`Failed to delete file ${resource.name}:`, error);
          failedIds.push(resource.resourceId);
        }
      }

      return {
        success: failedIds.length === 0,
        deletedCount: resources.length - failedIds.length,
        failedIds: failedIds.length > 0 ? failedIds : undefined
      };
    } catch (error) {
      console.error('Failed to batch delete files:', error);
      return {
        success: false,
        deletedCount: 0,
        message: '批量删除失败: ' + (error instanceof Error ? error.message : '未知错误')
      };
    }
  }

  /**
   * 分页查询所有图片
   * @param page 页码，从1开始
   * @param limit 每页数量
   * @returns 图片列表和分页信息
   */
  async getImages(page: number = 1, limit: number = 10) {
    // 验证参数
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;
    
    const skip = (page - 1) * limit;
    
    // 查询启用状态的图片资源
    const [images, total] = await this.resourcesRepository.findAndCount({
      where: {
        type: 'image',
        status: 1 // 仅查询启用状态的图片
      },
      order: {
        createdAt: 'DESC' // 按创建时间倒序排列
      },
      skip,
      take: limit
    });
    
    return {
      list: images,
      current: page,
      pageSize: limit,
      total
    };
  }
}