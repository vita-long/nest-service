import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Express } from 'express';
import { join, extname } from 'path';
import { existsSync, unlinkSync } from 'fs';

export interface MulterFile extends Express.Multer.File {}

@Injectable()
export class UploadService {
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
  async handleSingleUpload(file: MulterFile, type: keyof typeof this.allowedFileTypes): Promise<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
    mimetype: string;
    type: string;
  }> {
    try {
      // 验证文件类型
      if (type && !this.validateFileType(file, type)) {
        // 如果文件类型不允许，删除已上传的文件
        if (file.path && existsSync(file.path)) {
          unlinkSync(file.path);
        }
        throw new BadRequestException(`文件类型不允许上传。允许的类型: ${this.allowedFileTypes[type as keyof typeof this.allowedFileTypes]?.join(', ') || '所有类型'}`);
      }

      // 返回上传结果
      return {
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        type: type || 'default',
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('文件上传失败: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
          results.errors.push({
            originalname: file.originalname,
            error: `文件类型不允许上传。允许的类型: ${this.allowedFileTypes[type as keyof typeof this.allowedFileTypes]?.join(', ') || '所有类型'}`
          });
          results.success = false;
          continue;
        }

        // 添加到成功列表
        results.data.push({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          type: type || 'default',
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
  deleteFile(filename: string, type?: keyof typeof this.allowedFileTypes): boolean {
    try {
      const filePath = join(__dirname, '..', '..', '..', 'uploads', type || 'default', filename);
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