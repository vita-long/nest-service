import { Controller, Get, HttpStatus, Param, Query, Delete, Post, Body } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisCacheService } from '@/common/modules/cache/cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private redisCacheService: RedisCacheService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
    ]);
    return result;
  }

  /**
   * 获取所有Redis缓存列表
   * @param pattern 查询模式（可选）
   * @returns Redis缓存列表和状态信息
   */
  @Get('redis/list')
  async getRedisCacheInfo(@Query('pattern') pattern?: string) {
    try {
      // 测试Redis连接
      const isConnected = await this.redisCacheService.testConnection();
      
      // 构建响应数据
      const response = {
        status: isConnected ? 'UP' : 'DOWN',
        connected: isConnected,
        timestamp: new Date().toISOString(),
        pattern: pattern || '*',
      };
      
      // 如果连接正常，获取所有缓存信息
      if (isConnected) {
        // 获取所有缓存键和详细信息
        const allKeys = await this.redisCacheService.getAllKeys(pattern || '*');
        const cacheDetails = await this.redisCacheService.getAllCacheInfo(pattern || '*');
        
        // 格式化过期时间显示
        const formattedCacheDetails = cacheDetails.map(item => ({
          key: item.key,
          value: item.value,
          ttl: item.ttl, // 保留原始ttl值，方便程序处理
        }));
        
        response['cacheStats'] = {
          totalKeys: allKeys.length,
          detailsRetrieved: cacheDetails.length,
        };
        
        response['redisList'] = formattedCacheDetails;
      }
      
      return response;
    } catch (error) {
      return {
        status: 'ERROR',
        connected: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        pattern: pattern || '*',
      };
    }
  }

  /**
   * 根据键名获取特定的Redis缓存内容
   * @param key 缓存键名
   * @param prefix 键前缀（可选）
   * @returns 缓存内容或查询状态
   */
  @Get('redis/:key')
  async getRedisCacheByKey(
    @Param('key') key: string,
    @Query('prefix') prefix?: string
  ) {
    try {
      // 测试Redis连接
      const isConnected = await this.redisCacheService.testConnection();
      
      if (!isConnected) {
        return {
          status: 'DOWN',
          connected: false,
          timestamp: new Date().toISOString(),
          message: 'Redis connection is not available',
        };
      }
      
      // 获取缓存内容
      const cacheValue = await this.redisCacheService.get(key, prefix);
      
      // 检查键是否存在
      const keyExists = await this.redisCacheService.exists(key, prefix);
      
      // 获取过期时间
      const ttl = await this.redisCacheService.ttl(key, prefix);
      
      // 构建响应
      const response = {
        status: 'UP',
        connected: true,
        key: prefix ? `${prefix}:${key}` : key,
        exists: keyExists,
        timestamp: new Date().toISOString(),
        ttl: ttl === -1 ? 'Never expires' : ttl === -2 ? 'Key does not exist' : `${ttl} seconds`,
      };
      
      // 如果键存在，添加缓存值
      if (keyExists && cacheValue !== null) {
        response['value'] = cacheValue;
      }
      
      return response;
    } catch (error) {
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message,
        key: prefix ? `${prefix}:${key}` : key,
      };
    }
  }

  /**
   * 删除指定的Redis缓存
   * @param key 缓存键名
   * @param prefix 键前缀（可选）
   * @returns 删除操作的结果
   */
  @Delete('redis/:key')
  async deleteSingleRedisCache(
    @Param('key') key: string,
    @Query('prefix') prefix?: string
  ) {
    // 重定向到新的融合接口
    return this.deleteRedisCache({ keys: [key], prefix });
  }

  /**
   * 删除Redis缓存（支持单个键、多个键或按模式删除）
   * @param body 请求体，可以包含以下参数：
   * - keys: 字符串数组，指定要删除的键名
   * - pattern: 字符串，匹配模式，用于删除所有匹配的键
   * - prefix: 字符串，键名前缀（仅在使用keys参数时有效）
   * @returns 删除操作的结果
   * @note 如果同时提供keys和pattern，优先使用keys
   */
  @Post('redis/delete')
  async deleteRedisCache(
    @Body() body: { keys?: string[]; pattern?: string; prefix?: string }
  ) {
    try {
      // 测试Redis连接
      const isConnected = await this.redisCacheService.testConnection();
      
      if (!isConnected) {
        return {
          status: 'DOWN',
          connected: false,
          timestamp: new Date().toISOString(),
          message: 'Redis connection is not available',
        };
      }
      
      const { keys, pattern, prefix } = body;
      let keysToDelete: string[] = [];
      let usePrefix = true;
      
      // 优先处理keys参数
      if (keys && Array.isArray(keys) && keys.length > 0) {
        keysToDelete = keys;
      } else if (pattern) {
        keysToDelete = await this.redisCacheService.getAllKeys(pattern);
        usePrefix = false; // 使用pattern获取的是完整键名，不需要前缀
      } 
      // 如果都没有提供，返回错误
      else {
        return {
          status: 'BAD_REQUEST',
          connected: true,
          timestamp: new Date().toISOString(),
          message: 'Either keys array or pattern must be provided',
        };
      }
      
      if (keysToDelete.length === 0) {
        return {
          status: 'NOT_FOUND',
          connected: true,
          timestamp: new Date().toISOString(),
          message: pattern ? `No keys found matching pattern: ${pattern}` : 'No keys to delete',
          pattern: pattern,
          deletedKeys: 0
        };
      }
      
      // 记录删除结果
      const deletionResults = {
        totalKeys: keysToDelete.length,
        deletedKeys: 0,
        notFoundKeys: 0,
        failedKeys: 0,
        pattern: pattern,
        details: [] as Array<{ key: string; deleted: boolean; message: string }>
      };
      
      // 逐个删除键
      for (const key of keysToDelete) {
        // 根据使用场景确定是否需要前缀
        const currentPrefix = usePrefix ? prefix : undefined;
        const fullKey = currentPrefix ? `${currentPrefix}:${key}` : key;
        
        // 对于通过pattern获取的键，我们已经知道它存在，所以可以直接尝试删除
        const keyExists = usePrefix ? await this.redisCacheService.exists(key, currentPrefix) : true;
        
        if (!keyExists) {
          deletionResults.notFoundKeys++;
          deletionResults.details.push({
            key: fullKey,
            deleted: false,
            message: 'Key does not exist'
          });
          continue;
        }
        
        const deleteResult = await this.redisCacheService.delete(key, currentPrefix);
        
        if (deleteResult) {
          deletionResults.deletedKeys++;
          deletionResults.details.push({
            key: fullKey,
            deleted: true,
            message: 'Deleted successfully'
          });
        } else {
          deletionResults.failedKeys++;
          deletionResults.details.push({
            key: fullKey,
            deleted: false,
            message: 'Failed to delete'
          });
        }
      }
      
      // 构建响应
      let status: string;
      if (deletionResults.deletedKeys === deletionResults.totalKeys) {
        status = 'SUCCESS';
      } else if (deletionResults.deletedKeys > 0) {
        status = 'PARTIAL_SUCCESS';
      } else if (deletionResults.failedKeys > 0) {
        status = 'PARTIAL_FAILURE';
      } else {
        status = 'NOT_FOUND';
      }
      
      const response = {
        status,
        connected: true,
        timestamp: new Date().toISOString(),
        message: `Deleted ${deletionResults.deletedKeys} out of ${deletionResults.totalKeys} keys`,
        ...deletionResults,
        redisList: []
      };
      
      return response;
    } catch (error) {
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message,
        pattern: body.pattern,
      };
    }
  }
  
  // 为了保持向后兼容性，保留旧接口并将其重定向到新接口
  @Post('redis/delete-multiple')
  async deleteMultipleRedisCache(
    @Body() body: { keys: string[]; prefix?: string }
  ) {
    return this.deleteRedisCache({ keys: body.keys, prefix: body.prefix });
  }
  
  @Delete('redis/delete-all')
  async deleteAllRedisCache(
    @Query('pattern') pattern?: string
  ) {
    return this.deleteRedisCache({ pattern });
  }
}