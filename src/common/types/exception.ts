import { HttpStatus } from '@nestjs/common';

// 异常码枚举
export enum ErrorCode {
  // ========== 系统级错误 (10000-10999) ==========
  SYSTEM_ERROR = 10001,           // 系统内部错误
  SERVICE_UNAVAILABLE = 10002,    // 服务不可用
  DATABASE_ERROR = 10003,         // 数据库错误
  CACHE_ERROR = 10004,            // 缓存错误
  CONFIG_ERROR = 10005,           // 配置错误
  NETWORK_ERROR = 10006,          // 网络错误
  FILE_SYSTEM_ERROR = 10007,      // 文件系统错误
  
  // ========== 业务级错误 (11000-11999) ==========
  VALIDATION_ERROR = 11001,       // 参数校验失败
  BUSINESS_ERROR = 11002,         // 业务逻辑错误
  OPERATION_FAILED = 11003,       // 操作失败
  DUPLICATE_OPERATION = 11004,    // 重复操作
  RESOURCE_NOT_FOUND = 11005,     // 资源不存在
  RESOURCE_EXISTS = 11006,        // 资源已存在
  INVALID_OPERATION = 11007,      // 无效操作
  STATE_ERROR = 11008,            // 状态错误
  
  // ========== 认证授权错误 (12000-12999) ==========
  UNAUTHORIZED = 12001,           // 未授权访问
  TOKEN_INVALID = 12002,          // Token无效
  TOKEN_EXPIRED = 12003,          // Token过期
  PERMISSION_DENIED = 12004,      // 权限不足
  AUTH_FAILED = 12005,            // 认证失败
  ACCESS_DENIED = 12006,          // 访问被拒绝
  RATE_LIMIT_EXCEEDED = 12007,    // 请求频率超限
  
  // ========== 数据错误 (13000-13999) ==========
  DATA_NOT_FOUND = 13001,         // 数据不存在
  DATA_EXISTS = 13002,            // 数据已存在
  DATA_INVALID = 13003,           // 数据无效
  DATA_DUPLICATE = 13004,         // 数据重复
  DATA_FORMAT_ERROR = 13005,      // 数据格式错误
  DATA_UPDATE_FAILED = 13006,     // 数据更新失败
  
  // ========== 第三方服务错误 (14000-14999) ==========
  THIRD_PARTY_ERROR = 14001,      // 第三方服务错误
  EXTERNAL_API_ERROR = 14002,     // 外部API错误
  PAYMENT_ERROR = 14003,          // 支付服务错误
  SMS_SERVICE_ERROR = 14004,      // 短信服务错误
  EMAIL_SERVICE_ERROR = 14005,    // 邮件服务错误
  
  // ========== 文件操作错误 (15000-15999) ==========
  FILE_UPLOAD_ERROR = 15001,      // 文件上传失败
  FILE_DOWNLOAD_ERROR = 15002,    // 文件下载失败
  FILE_SIZE_EXCEEDED = 15003,     // 文件大小超限
  FILE_TYPE_INVALID = 15004,      // 文件类型无效
  FILE_NOT_FOUND = 15005,         // 文件不存在
  FILE_DELETE_ERROR = 15006,      // 文件删除失败
  
  // ========== 系统资源错误 (16000-16999) ==========
  RESOURCE_LIMIT_EXCEEDED = 16001, // 资源超限
  MEMORY_LIMIT_EXCEEDED = 16002,   // 内存不足
  STORAGE_LIMIT_EXCEEDED = 16003,  // 存储空间不足
  CONCURRENT_LIMIT_EXCEEDED = 16004, // 并发数超限
}

// HTTP状态码映射
export const ErrorCodeToHttpStatus: Record<ErrorCode, HttpStatus> = {
  // 系统级错误
  [ErrorCode.SYSTEM_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.DATABASE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.CACHE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.CONFIG_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.NETWORK_ERROR]: HttpStatus.BAD_GATEWAY,
  [ErrorCode.FILE_SYSTEM_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  
  // 业务级错误
  [ErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.BUSINESS_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.OPERATION_FAILED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.DUPLICATE_OPERATION]: HttpStatus.CONFLICT,
  [ErrorCode.RESOURCE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.RESOURCE_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.INVALID_OPERATION]: HttpStatus.BAD_REQUEST,
  [ErrorCode.STATE_ERROR]: HttpStatus.BAD_REQUEST,
  
  // 认证授权错误
  [ErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_INVALID]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [ErrorCode.AUTH_FAILED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.ACCESS_DENIED]: HttpStatus.FORBIDDEN,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
  
  // 数据错误
  [ErrorCode.DATA_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.DATA_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.DATA_INVALID]: HttpStatus.BAD_REQUEST,
  [ErrorCode.DATA_DUPLICATE]: HttpStatus.CONFLICT,
  [ErrorCode.DATA_FORMAT_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.DATA_UPDATE_FAILED]: HttpStatus.BAD_REQUEST,
  
  // 第三方服务错误
  [ErrorCode.THIRD_PARTY_ERROR]: HttpStatus.BAD_GATEWAY,
  [ErrorCode.EXTERNAL_API_ERROR]: HttpStatus.BAD_GATEWAY,
  [ErrorCode.PAYMENT_ERROR]: HttpStatus.BAD_GATEWAY,
  [ErrorCode.SMS_SERVICE_ERROR]: HttpStatus.BAD_GATEWAY,
  [ErrorCode.EMAIL_SERVICE_ERROR]: HttpStatus.BAD_GATEWAY,
  
  // 文件操作错误
  [ErrorCode.FILE_UPLOAD_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.FILE_DOWNLOAD_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.FILE_SIZE_EXCEEDED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.FILE_TYPE_INVALID]: HttpStatus.BAD_REQUEST,
  [ErrorCode.FILE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.FILE_DELETE_ERROR]: HttpStatus.BAD_REQUEST,
  
  // 系统资源错误
  [ErrorCode.RESOURCE_LIMIT_EXCEEDED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.MEMORY_LIMIT_EXCEEDED]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.STORAGE_LIMIT_EXCEEDED]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.CONCURRENT_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
};

// 错误消息映射
export const ErrorCodeToMessage: Record<ErrorCode, string> = {
  // 系统级错误
  [ErrorCode.SYSTEM_ERROR]: '系统内部错误，请稍后重试',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后重试',
  [ErrorCode.DATABASE_ERROR]: '数据库操作失败，请稍后重试',
  [ErrorCode.CACHE_ERROR]: '缓存操作失败，请稍后重试',
  [ErrorCode.CONFIG_ERROR]: '系统配置错误，请联系管理员',
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ErrorCode.FILE_SYSTEM_ERROR]: '文件系统操作失败，请稍后重试',
  
  // 业务级错误
  [ErrorCode.VALIDATION_ERROR]: '参数校验失败，请检查输入参数',
  [ErrorCode.BUSINESS_ERROR]: '业务逻辑错误，请按照提示操作',
  [ErrorCode.OPERATION_FAILED]: '操作执行失败，请稍后重试',
  [ErrorCode.DUPLICATE_OPERATION]: '操作重复，请避免重复提交',
  [ErrorCode.RESOURCE_NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.RESOURCE_EXISTS]: '资源已存在，无法重复创建',
  [ErrorCode.INVALID_OPERATION]: '无效的操作请求',
  [ErrorCode.STATE_ERROR]: '资源状态错误，无法执行操作',
  
  // 认证授权错误
  [ErrorCode.UNAUTHORIZED]: '未授权访问，请先登录',
  [ErrorCode.TOKEN_INVALID]: '身份令牌无效，请重新登录',
  [ErrorCode.TOKEN_EXPIRED]: '身份令牌已过期，请重新登录',
  [ErrorCode.PERMISSION_DENIED]: '权限不足，无法执行此操作',
  [ErrorCode.AUTH_FAILED]: '认证失败，请检查登录凭证',
  [ErrorCode.ACCESS_DENIED]: '访问被拒绝',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求频率过高，请稍后再试',
  
  // 数据错误
  [ErrorCode.DATA_NOT_FOUND]: '请求的数据不存在',
  [ErrorCode.DATA_EXISTS]: '数据已存在，无法重复添加',
  [ErrorCode.DATA_INVALID]: '数据无效，请检查输入',
  [ErrorCode.DATA_DUPLICATE]: '数据重复，请避免重复添加',
  [ErrorCode.DATA_FORMAT_ERROR]: '数据格式错误，请检查输入',
  [ErrorCode.DATA_UPDATE_FAILED]: '数据更新失败，请稍后重试',
  
  // 第三方服务错误
  [ErrorCode.THIRD_PARTY_ERROR]: '第三方服务错误，请稍后重试',
  [ErrorCode.EXTERNAL_API_ERROR]: '外部API调用失败，请稍后重试',
  [ErrorCode.PAYMENT_ERROR]: '支付服务异常，请稍后重试',
  [ErrorCode.SMS_SERVICE_ERROR]: '短信服务异常，请稍后重试',
  [ErrorCode.EMAIL_SERVICE_ERROR]: '邮件服务异常，请稍后重试',
  
  // 文件操作错误
  [ErrorCode.FILE_UPLOAD_ERROR]: '文件上传失败，请稍后重试',
  [ErrorCode.FILE_DOWNLOAD_ERROR]: '文件下载失败，请稍后重试',
  [ErrorCode.FILE_SIZE_EXCEEDED]: '文件大小超出限制',
  [ErrorCode.FILE_TYPE_INVALID]: '不支持的文件类型',
  [ErrorCode.FILE_NOT_FOUND]: '文件不存在',
  [ErrorCode.FILE_DELETE_ERROR]: '文件删除失败，请稍后重试',
  
  // 系统资源错误
  [ErrorCode.RESOURCE_LIMIT_EXCEEDED]: '资源使用超出限制',
  [ErrorCode.MEMORY_LIMIT_EXCEEDED]: '系统内存不足，请稍后重试',
  [ErrorCode.STORAGE_LIMIT_EXCEEDED]: '存储空间不足，请清理空间',
  [ErrorCode.CONCURRENT_LIMIT_EXCEEDED]: '并发请求数超出限制，请稍后再试',
};

// 导出异常类型
export interface ErrorResponse {
  code: ErrorCode;
  msg: string;
  data?: any;
  details?: any;
  timestamp: string;
}