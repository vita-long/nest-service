import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientOptions } from 'redis';
import redisConfig, { createRedisClientOptions } from './redis.config';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly defaultTtl = 3600; // 默认过期时间（秒）
  private client: any; // 使用any类型避免类型兼容性问题
  private isConnected = false;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  /**
   * 初始化Redis客户端
   */
  private async initializeClient() {
    try {
      const config = this.configService.get('redis');
      const options = createRedisClientOptions(config);
      
      // 显式指定类型参数以避免类型兼容性问题
      this.client = createClient(options as RedisClientOptions);

      // 监听连接事件
      this.client.on('connect', () => {
        this.logger.log('Redis client is connecting...');
      });

      this.client.on('ready', () => {
        this.logger.log('Redis client is ready');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        this.logger.error(`Redis client error: ${error.message}`, error.stack);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        this.logger.log('Redis client connection ended');
        this.isConnected = false;
      });

      // 连接Redis
      await this.client.connect();
    } catch (error) {
      this.logger.error(`Failed to initialize Redis client: ${error.message}`, error.stack);
    }
  }

  /**
   * 生成缓存键
   * @param key 基础键名
   * @param prefix 前缀（可选）
   * @returns 格式化后的缓存键
   */
  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒，可选）
   * @param prefix 键前缀（可选）
   * @returns 是否设置成功
   */
  async set<T = any>(
    key: string,
    value: T,
    ttl?: number,
    prefix?: string,
  ): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping cache set');
        return false;
      }

      const cacheKey = this.generateKey(key, prefix);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      const expireTime = ttl || this.defaultTtl;

      await this.client.set(cacheKey, serializedValue, {
        EX: expireTime,
      });

      this.logger.debug(`Cache set successfully for key: ${cacheKey}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @param prefix 键前缀（可选）
   * @returns 缓存值或null
   */
  async get<T = any>(key: string, prefix?: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping cache get');
        return null;
      }

      const cacheKey = this.generateKey(key, prefix);
      const value = await this.client.get(cacheKey);

      if (!value) {
        return null;
      }

      // 尝试解析JSON，如果失败则返回原始字符串
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   * @param prefix 键前缀（可选）
   * @returns 是否删除成功
   */
  async delete(key: string, prefix?: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping cache delete');
        return false;
      }

      const cacheKey = this.generateKey(key, prefix);
      const result = await this.client.del(cacheKey);
      
      const success = result > 0;
      if (success) {
        this.logger.debug(`Cache deleted successfully for key: ${cacheKey}`);
      }
      
      return success;
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 检查键是否存在
   * @param key 缓存键
   * @param prefix 键前缀（可选）
   * @returns 是否存在
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping cache exists check');
        return false;
      }

      const cacheKey = this.generateKey(key, prefix);
      const result = await this.client.exists(cacheKey);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to check existence for key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 清除所有缓存
   * @returns 是否清除成功
   */
  async clear(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping cache clear');
        return false;
      }

      await this.client.flushDb();
      this.logger.log('All cache cleared successfully');
      return true;
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 设置键的过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   * @param prefix 键前缀（可选）
   * @returns 是否设置成功
   */
  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping cache expire');
        return false;
      }

      const cacheKey = this.generateKey(key, prefix);
      const result = await this.client.expire(cacheKey, ttl);
      // Redis expire命令返回1表示成功，0表示键不存在，转换为布尔值
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to set expire for key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 获取键的剩余过期时间
   * @param key 缓存键
   * @param prefix 键前缀（可选）
   * @returns 剩余过期时间（秒），-1表示永不过期，-2表示键不存在
   */
  async ttl(key: string, prefix?: string): Promise<number> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping cache ttl');
        return -2;
      }

      const cacheKey = this.generateKey(key, prefix);
      return await this.client.ttl(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to get ttl for key ${key}: ${error.message}`, error.stack);
      return -2;
    }
  }

  /**
   * 获取所有键的列表
   * @param pattern 匹配模式（可选），默认为'*'匹配所有键
   * @returns 键名数组
   */
  async getAllKeys(pattern: string = '*'): Promise<string[]> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping get all keys');
        return [];
      }

      const keys = await this.client.keys(pattern);
      this.logger.debug(`Retrieved ${keys.length} keys with pattern: ${pattern}`);
      return keys;
    } catch (error) {
      this.logger.error(`Failed to get all keys: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 获取所有缓存的详细信息
   * @param pattern 匹配模式（可选），默认为'*'匹配所有键
   * @returns 缓存信息数组，包含键名、值和过期时间
   */
  async getAllCacheInfo(pattern: string = '*'): Promise<Array<{key: string, value: any, ttl: number}>> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, skipping get all cache info');
        return [];
      }

      const keys = await this.getAllKeys(pattern);
      const cacheInfo: Array<{key: string, value: any, ttl: number}> = [];

      for (const key of keys) {
        try {
          // 获取缓存值
          const value = await this.client.get(key);
          // 获取过期时间
          const ttl = await this.client.ttl(key);
          
          // 尝试解析JSON
          let parsedValue;
          try {
            parsedValue = value ? JSON.parse(value) : value;
          } catch {
            parsedValue = value;
          }
          
          cacheInfo.push({
            key,
            value: parsedValue,
            ttl,
          });
        } catch (itemError) {
          this.logger.warn(`Failed to get info for key ${key}: ${itemError.message}`);
          // 跳过单个键的错误，继续处理其他键
        }
      }

      this.logger.debug(`Retrieved details for ${cacheInfo.length} keys`);
      return cacheInfo;
    } catch (error) {
      this.logger.error(`Failed to get all cache info: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 测试Redis连接
   * @returns 连接是否正常
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.initializeClient();
      }
      
      await this.client.ping();
      this.logger.debug('Redis connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`Redis connection test failed: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 断开Redis连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.logger.log('Redis client disconnected');
      }
    } catch (error) {
      this.logger.error(`Failed to disconnect Redis client: ${error.message}`, error.stack);
    }
  }
}