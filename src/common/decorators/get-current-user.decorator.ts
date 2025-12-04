import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前用户的装饰器
 * 从请求对象中提取user信息，用于在控制器方法中获取当前登录用户
 */
export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // 如果提供了特定字段名，则只返回该字段的值
    if (data) {
      return user?.[data];
    }
    
    // 否则返回完整的用户对象
    return user;
  },
);