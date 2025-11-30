import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

export interface LoggerOptions {
  context?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const winstonConfig = this.configService.get('logger.winston') || {};
    this.logger = winston.createLogger(winstonConfig);
  }

  /**
   * 记录调试级别日志
   */
  debug(message: any, options?: LoggerOptions): void {
    this.log('debug', message, options);
  }

  /**
   * 记录信息级别日志（Nest标准接口）
   */
  log(message: any, context?: string, ...rest: any[]): void {
    const options = context ? { context } : {};
    this.logger.info(this.normalizeMessage(message), this.getMeta(options));
  }

  /**
   * 记录信息级别日志（明确的info级别）
   */
  info(message: any, options?: LoggerOptions): void {
    this.logger.info(this.normalizeMessage(message), this.getMeta(options));
  }

  /**
   * 记录警告级别日志
   */
  warn(message: any, options?: LoggerOptions): void {
    this.logger.warn(this.normalizeMessage(message), this.getMeta(options));
  }

  /**
   * 记录错误级别日志
   */
  error(message: any, options?: LoggerOptions): void {
    // 如果是错误对象，提取错误信息和堆栈
    if (message instanceof Error) {
      this.logger.error(
        message.message,
        {
          ...this.getMeta(options),
          stack: message.stack,
          error: message.name,
        },
      );
    } else {
      this.logger.error(this.normalizeMessage(message), this.getMeta(options));
    }
  }

  /**
   * 记录致命错误
   */
  fatal(message: any, options?: LoggerOptions): void {
    this.logger.error(`[FATAL] ${this.normalizeMessage(message)}`, this.getMeta(options));
  }

  /**
   * 为特定上下文创建logger实例
   */
  createLogger(context: string): LoggerService {
    return {
      ...this,
      debug: (message: any, options?: LoggerOptions) => 
        this.debug(message, { ...options, context }),
      log: (message: any, options?: LoggerOptions) => {
        // 兼容Nest标准log方法接口
        if (typeof options === 'string') {
          return this.log(message, options);
        }
        return this.info(message, { ...options, context });
      },
      info: (message: any, options?: LoggerOptions) => 
        this.info(message, { ...options, context }),
      warn: (message: any, options?: LoggerOptions) => 
        this.warn(message, { ...options, context }),
      error: (message: any, options?: LoggerOptions) => 
        this.error(message, { ...options, context }),
      fatal: (message: any, options?: LoggerOptions) => 
        this.fatal(message, { ...options, context }),
    } as LoggerService;
  }

  /**
   * 标准化日志消息
   */
  private normalizeMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    
    try {
      return typeof message === 'object' ? JSON.stringify(message) : String(message);
    } catch (e) {
      return String(message);
    }
  }

  /**
   * 获取元数据
   */
  private getMeta(options?: LoggerOptions): any {
    if (!options) {
      return {};
    }
    
    const { context, ...rest } = options;
    return {
      context,
      ...rest,
    };
  }
}