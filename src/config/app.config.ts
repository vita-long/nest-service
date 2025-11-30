import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  cors: process.env.CORS_ENABLED === 'true',
  globalPrefix: process.env.GLOBAL_PREFIX || 'api',
}));