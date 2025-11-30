import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../modules/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    // 处理验证错误
    if (exception instanceof BadRequestException) {
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'object' && responseBody !== null) {
        const validationErrors = (responseBody as any).message;
        if (Array.isArray(validationErrors)) {
          // 确保所有错误都转换为字符串
          message = validationErrors.map((error: any): string => {
            // 如果是对象且有constraints属性，提取详细错误信息
            if (typeof error === 'object' && error.constraints) {
              return Object.values(error.constraints).join(', ');
            }
            // 其他情况直接转换为字符串
            return String(error);
          });
        }
      }
    }

    // 记录异常信息到日志
    const logOptions = {
      context: 'GlobalExceptionFilter',
      path: request?.url || '',
      method: request?.method || '',
      userId: request?.user?.userId || null,
    };

    if (status >= 500) {
      this.logger.error(exception, logOptions);
    } else {
      this.logger.warn(exception.message, logOptions);
    }

    const errorResponse = {
      code: status,
      data: null,
      msg: message,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}