import { Injectable, HttpStatus } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCode } from '@/common/types/exception';
import { Express } from 'express';
import { join, extname } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async handleSingleUpload(file: MulterFile, type: keyof typeof this.allowedFileTypes): Promise<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
    mimetype: string;
    type: string;
    resourceId: string;
  }> {
    try {
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
      resource.path = file.path;
      resource.type = type || 'default';
      resource.format = extname(file.originalname).substring(1).toLowerCase(); // 移除点号
          resource.size = file.size;
          resource.status = 1; // 默认启用
          resource.resourceId = this.generateResourceId(); // 自定义生成资源ID
          // userId可以在需要时设置，当前保持为null

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
  async handleBatchUpload(files: MulterFile[], type: keyof typeof this.allowedFileTypes): Promise<{
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
   * 删除文件
   * @param filename 文件名
   * @param type 文件类型目录
   * @returns 是否成功
   */
  async deleteFile(filename: string, type?: keyof typeof this.allowedFileTypes): Promise<boolean> {
    try {
      const filePath = join(__dirname, '..', '..', '..', 'uploads', type || 'default', filename);
      
      // 先从数据库中查找并软删除资源记录
      const resource = await this.resourcesRepository.findOne({
        where: {
          path: filePath,
          type: type || 'default'
        }
      });
      
      if (resource) {
        resource.status = 2; // 标记为已删除
        await this.resourcesRepository.save(resource);
      }
      
      // 然后删除实际文件
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }
}