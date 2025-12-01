import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../modules/logger/logger.service';
import { ErrorCode, ErrorCodeToHttpStatus, ErrorCodeToMessage } from '../types/exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 初始化响应对象
    let errorResponse = {
      code: ErrorCode.SYSTEM_ERROR,
      msg: '系统内部错误',
      data: null,
      details: null,
      timestamp: new Date().toISOString(),
    };

    // 获取HTTP状态码
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    // 处理自定义异常（已经包含code和msg的异常响应）
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      // 检查是否是我们的自定义异常响应格式
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const customResponse = exceptionResponse as any;
        
        if (customResponse.code && customResponse.msg) {
          // 自定义异常响应格式
          errorResponse = {
            code: customResponse.code,
            msg: customResponse.msg,
            data: customResponse.data || null,
            details: customResponse.details || null,
            timestamp: new Date().toISOString(),
          };
          statusCode = exception.getStatus();
        } else {
          // NestJS 标准 HttpException
          statusCode = exception.getStatus();
          
          // 处理验证错误
          if (exception instanceof BadRequestException) {
            errorResponse.code = ErrorCode.VALIDATION_ERROR;
            
            if (Array.isArray(customResponse.message)) {
              // 确保所有错误都转换为字符串
              const messages = customResponse.message.map((error: any): string => {
                // 如果是对象且有constraints属性，提取详细错误信息
                if (typeof error === 'object' && error.constraints) {
                  return Object.values(error.constraints).join(', ');
                }
                // 其他情况直接转换为字符串
                return String(error);
              });
              errorResponse.msg = messages.join('; ');
            } else {
              errorResponse.msg = String(customResponse.message || ErrorCodeToMessage[ErrorCode.VALIDATION_ERROR]);
            }
          } else {
            // 其他HttpException
            errorResponse.code = this.mapHttpStatusToErrorCode(statusCode);
            errorResponse.msg = String(customResponse.message || exception.message);
          }
        }
      } else {
        // 简单的字符串消息异常
        statusCode = exception.getStatus();
        errorResponse.code = this.mapHttpStatusToErrorCode(statusCode);
        errorResponse.msg = String(exceptionResponse);
      }
    } else {
      // 非HttpException（未预期的错误）
      errorResponse.code = ErrorCode.SYSTEM_ERROR;
      errorResponse.msg = ErrorCodeToMessage[ErrorCode.SYSTEM_ERROR];
      
      // 在开发环境可以显示详细错误信息
      if (process.env.NODE_ENV !== 'production') {
        errorResponse.details = exception.message || 'Unknown error';
      }
    }

    // 记录异常信息到日志
    const logOptions = {
      context: 'GlobalExceptionFilter',
      path: request?.url || '',
      method: request?.method || '',
      userId: request?.user?.userId || null,
      errorCode: errorResponse.code,
    };

    if (statusCode >= 500) {
      this.logger.error(exception, logOptions);
    } else {
      this.logger.warn(errorResponse.msg, logOptions);
    }

    response.status(statusCode).json(errorResponse);
  }

  /**
   * 将HTTP状态码映射到错误码
   */
  private mapHttpStatusToErrorCode(statusCode: HttpStatus): ErrorCode {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.PERMISSION_DENIED;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.RESOURCE_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.RESOURCE_EXISTS;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.SYSTEM_ERROR;
    }
  }
}