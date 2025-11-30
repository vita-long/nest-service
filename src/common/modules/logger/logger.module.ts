import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';
import loggerConfig from './logger.config';
import * as fs from 'fs';
import * as path from 'path';

@Global()
@Module({
  imports: [ConfigModule.forFeature(loggerConfig)],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule implements OnModuleInit {
  /**
   * 模块初始化时创建日志目录
   */
  onModuleInit() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }
}