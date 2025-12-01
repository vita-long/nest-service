import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Resources } from '@/entities/resources.entity';

// 确保上传目录存在
const uploadDir = join(__dirname, '..', '..', '..', 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Resources]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = ((req.body?.type as string) || req.params.type as string || 'default');
          const typeDir = join(uploadDir, type);
          
          if (!existsSync(typeDir)) {
            mkdirSync(typeDir, { recursive: true });
          }
          
          cb(null, typeDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}