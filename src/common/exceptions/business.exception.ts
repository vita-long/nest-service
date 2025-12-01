import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorCodeToHttpStatus, ErrorCodeToMessage } from '../types/exception';

/**
 * 业务异常类，用于统一处理业务逻辑错误
 */
export class BusinessException extends HttpException {
  constructor(
    errorCode: ErrorCode,
    message?: string,
    details?: any,
  ) {
    // 获取对应的HTTP状态码
    const statusCode = ErrorCodeToHttpStatus[errorCode] || HttpStatus.BAD_REQUEST;
    
    // 如果没有提供自定义消息，使用默认消息
    const errorMessage = message || ErrorCodeToMessage[errorCode] || '未知错误';
    
    // 构建异常响应对象
    const response = {
      code: errorCode,
      msg: errorMessage,
      details: details,
      timestamp: new Date().toISOString(),
    };
    
    super(response, statusCode);
  }
}

/**
 * 验证异常类，用于参数校验错误
 */
export class ValidationException extends HttpException {
  constructor(message: string | string[], details?: any) {
    const response = {
      code: ErrorCode.VALIDATION_ERROR,
      msg: Array.isArray(message) ? message.join('; ') : message,
      details: details,
      timestamp: new Date().toISOString(),
    };
    
    super(response, HttpStatus.BAD_REQUEST);
  }
}

/**
 * 资源不存在异常
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resourceName: string, resourceId?: any) {
    const response = {
      code: ErrorCode.RESOURCE_NOT_FOUND,
      msg: `${resourceName}${resourceId ? ` (ID: ${resourceId})` : ''} 不存在`,
      timestamp: new Date().toISOString(),
    };
    
    super(response, HttpStatus.NOT_FOUND);
  }
}

/**
 * 权限异常
 */
export class PermissionException extends HttpException {
  constructor(message?: string) {
    const response = {
      code: ErrorCode.PERMISSION_DENIED,
      msg: message || ErrorCodeToMessage[ErrorCode.PERMISSION_DENIED],
      timestamp: new Date().toISOString(),
    };
    
    super(response, HttpStatus.FORBIDDEN);
  }
}

/**
 * 认证异常
 */
export class AuthException extends HttpException {
  constructor(errorCode: ErrorCode.TOKEN_INVALID | ErrorCode.TOKEN_EXPIRED | ErrorCode.AUTH_FAILED = ErrorCode.AUTH_FAILED, message?: string) {
    const response = {
      code: errorCode,
      msg: message || ErrorCodeToMessage[errorCode],
      timestamp: new Date().toISOString(),
    };
    
    super(response, HttpStatus.UNAUTHORIZED);
  }
}