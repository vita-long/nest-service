import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '@/config';
import { RedisCacheService } from '../modules/cache/cache.service';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisCacheService: RedisCacheService
  ) {}

  // 使用forFeature注册配置
  static imports = [ConfigModule.forFeature(jwtConfig)];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const algorithm = this.configService.get('jwt.algorithm') || 'HS256';
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get('jwt.secret'),
        algorithms: [algorithm],
      });
      
      // 验证令牌是否在Redis中存在（通过用户ID查找所有活跃令牌）
      const userId = payload.userId;
      const userTokenKey = `user:${userId}:tokens`;
      const userTokens = await this.redisCacheService.get<string[]>(userTokenKey);
      
      if (!userTokens || userTokens.length === 0) {
        this.logger.warn('Token validation failed: No active tokens found for user', { userId });
        throw new UnauthorizedException('Token has been invalidated');
      }
      
      // 检查令牌是否在Redis中有效
      let tokenFound = false;
      for (const tokenId of userTokens) {
        const storedTokenData = await this.redisCacheService.get<any>(
          tokenId, 
          'access_token'
        );
        
        if (storedTokenData && storedTokenData.accessToken === token) {
          tokenFound = true;
          break;
        }
      }
      
      if (!tokenFound) {
        this.logger.warn('Token validation failed: Token not found in Redis', { userId });
        throw new UnauthorizedException('Token has been invalidated');
      }
      
      request.user = payload;
      this.logger.debug('Token validation successful', { userId });
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Token validation error', { error: error.message });
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}