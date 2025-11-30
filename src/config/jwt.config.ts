import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default_jwt_secret_key', // 提供默认值，生产环境应该从环境变量获取
  expiresIn: process.env.JWT_EXPIRES_IN || '7200', // 默认过期时间2小时
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '25200', // 刷新令牌默认7天
  algorithm: process.env.JWT_ALGORITHM || 'HS256' as const, // JWT算法，使用as const确保类型正确
}));