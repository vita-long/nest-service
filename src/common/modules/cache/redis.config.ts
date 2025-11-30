import { registerAs } from '@nestjs/config';
import { RedisClientOptions } from 'redis';

/**
 * Redis配置
 */
const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0', 10),
  // 连接超时（毫秒）
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000', 10),
  // 重连策略（返回false表示停止重试）
  reconnectStrategy: (retries: number) => {
    // 最多重试10次，每次间隔递增
    return retries > 10 ? false : retries * 100;
  },
}));

/**
 * 创建Redis客户端配置
 * @param config Redis配置对象
 * @returns Redis客户端选项
 */
export const createRedisClientOptions = (config: ReturnType<typeof redisConfig>): RedisClientOptions => {
  // 构建Redis连接URL
  const url = config.password 
    ? `redis://:${config.password}@${config.host}:${config.port}/${config.db}`
    : `redis://${config.host}:${config.port}/${config.db}`;

  return {
    url,
    socket: {
      connectTimeout: config.connectTimeout,
      reconnectStrategy: config.reconnectStrategy,
    },
    database: config.db,
  };
};

// 导出配置
export default redisConfig;