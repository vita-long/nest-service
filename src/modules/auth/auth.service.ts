import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoggerService } from '../../common/modules/logger/logger.service';
import { RedisCacheService } from '../../common/modules/cache/cache.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId?: string;
}

// 缓存键前缀常量
const CACHE_PREFIX = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_TOKEN: 'user_token',
};

@Injectable()
export class AuthService {
  private logger;
  
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private loggerService: LoggerService,
    private redisCacheService: RedisCacheService,
  ) {
    this.logger = loggerService.createLogger('AuthService');
  }

  async register(registerDto: RegisterDto) {
    const { username } = registerDto;
    this.logger.info('用户注册请求', { username });

    // 用户是否存在
    const existingUser = await this.userService.findOneByUsername(username);
    if (existingUser) {
      this.logger.warn('用户名已存在', { username });
      throw new ConflictException('当前用户名已注册');
    }

    // Create new user
    const newUser = await this.userService.create(registerDto);

    this.logger.info('用户注册成功', { userId: newUser.userId, username: newUser.username });
    
    return {
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string) {
    const { username } = loginDto;
    this.logger.info('用户登录请求', { username, ipAddress });

    // 验证用户名
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      this.logger.warn('用户不存在', { username });
      throw new UnauthorizedException('Invalid credentials');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn('密码验证失败', { username });
      throw new UnauthorizedException('Invalid credentials');
    }

    // 更新用户登录信息
    await this.userService.update(user.userId, {
      status: true,
      lastLoginTime: new Date(),
      lastLoginIp: ipAddress
    });

    // 检查用户是否已有活跃令牌，如果有则使其失效
    const existingTokenKey = `user:${user.userId}:tokens`;
    const existingTokens = await this.redisCacheService.get<string[]>(existingTokenKey);
    
    if (existingTokens && Array.isArray(existingTokens) && existingTokens.length > 0) {
      // 使所有现有令牌失效
      for (const tokenId of existingTokens) {
        await this.redisCacheService.delete(tokenId, CACHE_PREFIX.ACCESS_TOKEN);
        await this.redisCacheService.delete(tokenId, CACHE_PREFIX.REFRESH_TOKEN);
      }
      // 清空用户令牌列表
      await this.redisCacheService.delete(existingTokenKey);
    }

    // Generate tokens
    const tokens = this.generateTokens(user);
    
    // 获取令牌过期时间（秒）
    const accessTokenExpiresIn = parseInt(this.configService.get('jwt.expiresIn', '7200'), 10);
    const refreshTokenExpiresIn = parseInt(this.configService.get('jwt.refreshTokenExpiresIn', '86400'), 10);
    
    // 生成唯一的tokenId
    const tokenId = `${user.userId}:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
    
    // 存储令牌到Redis
    await this.redisCacheService.set(
      tokenId,
      { userId: user.userId, accessToken: tokens.accessToken },
      accessTokenExpiresIn,
      CACHE_PREFIX.ACCESS_TOKEN
    );
    
    await this.redisCacheService.set(
      tokenId,
      { userId: user.userId, refreshToken: tokens.refreshToken },
      refreshTokenExpiresIn,
      CACHE_PREFIX.REFRESH_TOKEN
    );
    
    // 存储用户的活跃令牌ID列表
      const tokenIds: string[] = [tokenId];
      await this.redisCacheService.set(
        existingTokenKey,
        tokenIds,
        refreshTokenExpiresIn
      );
    
    this.logger.info('用户登录成功', { userId: user.userId, username: user.username, ipAddress });
    const { password, ...otherUserInfo } = user;
    return {
      user: otherUserInfo,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }



  /**
   * 生成访问令牌和刷新令牌
   */
  private generateTokens(user: User) {
    // 生成访问令牌
    const accessTokenPayload: JwtPayload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(accessTokenPayload);

    // 生成刷新令牌
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.userId,
    };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get('jwt.refreshTokenSecret'),
      expiresIn: this.configService.get('jwt.refreshTokenExpiresIn'),
      algorithm: this.configService.get('jwt.algorithm'),
    });

    return { accessToken, refreshToken };
  }

  /**
   * 退出登录，将用户状态设置为离线并使所有令牌失效
   */
  async logout(userId: string): Promise<void> {
    this.logger.info('用户退出登录', { userId });
    
    // 获取用户的活跃令牌列表
    const existingTokenKey = `user:${userId}:tokens`;
    const existingTokens = await this.redisCacheService.get<string[]>(existingTokenKey);
    
    if (existingTokens && existingTokens.length > 0) {
      // 使所有令牌失效
      for (const tokenId of existingTokens) {
        await this.redisCacheService.delete(tokenId, CACHE_PREFIX.ACCESS_TOKEN);
        await this.redisCacheService.delete(tokenId, CACHE_PREFIX.REFRESH_TOKEN);
        this.logger.debug(`Token ${tokenId} invalidated during logout`, { userId });
      }
      // 清空用户令牌列表
      await this.redisCacheService.delete(existingTokenKey);
    }
    
    // 更新用户状态为离线
      await this.userService.update(userId, {
        status: false
      } as any);

    this.logger.info('用户退出登录成功，所有令牌已失效', { userId });
  }

  /**
   * 使用刷新令牌获取新的访问令牌
   */
  async refreshToken(refreshToken: string) {
    this.logger.info('刷新令牌请求', { token: refreshToken.substring(0, 10) + '...' });
    
    try {
      // 验证刷新令牌
      const algorithm = this.configService.get('jwt.algorithm') || 'HS256';
      const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get('jwt.refreshTokenSecret'),
        algorithms: [algorithm],
      });

      const userId = payload.userId;
      this.logger.info('刷新令牌请求: 用户ID ' + userId, { userId });
      
      // 获取用户信息
      const user = await this.userService.findById(userId);
      if (!user) {
        this.logger.warn('刷新令牌失败：用户不存在', { userId });
        throw new UnauthorizedException('用户不存在');
      }
      
      // 检查用户的活跃令牌列表，验证刷新令牌是否有效
      const existingTokenKey = `user:${userId}:tokens`;
      const existingTokens = await this.redisCacheService.get<string[]>(existingTokenKey);
      
      if (!existingTokens || existingTokens.length === 0) {
        this.logger.warn('刷新令牌失败：用户无活跃令牌', { userId });
        throw new UnauthorizedException('无效的刷新令牌');
      }
      
      // 验证刷新令牌是否在Redis中存在（通过查找匹配的refreshToken）
      let validTokenId: string | null = null;
      for (const tokenId of existingTokens) {
        const storedRefreshTokenData = await this.redisCacheService.get<any>(
          tokenId, 
          CACHE_PREFIX.REFRESH_TOKEN
        );
        
        if (storedRefreshTokenData && storedRefreshTokenData.refreshToken === refreshToken) {
          validTokenId = tokenId;
          break;
        }
      }
      
      if (!validTokenId) {
        this.logger.warn('刷新令牌失败：令牌未在Redis中找到', { userId });
        throw new UnauthorizedException('无效的刷新令牌');
      }

      // 生成新的令牌
      const tokens = this.generateTokens(user as User);
      
      // 获取新令牌过期时间
      const accessTokenExpiresIn = parseInt(this.configService.get('jwt.expiresIn', '3600'), 10);
      const refreshTokenExpiresIn = parseInt(this.configService.get('jwt.refreshTokenExpiresIn', '86400'), 10);
      
      // 生成新的tokenId
      const newTokenId = `${user.userId}:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
      
      // 存储新令牌到Redis
      await this.redisCacheService.set(
        newTokenId,
        { userId: user.userId, accessToken: tokens.accessToken },
        accessTokenExpiresIn,
        CACHE_PREFIX.ACCESS_TOKEN
      );
      
      await this.redisCacheService.set(
        newTokenId,
        { userId: user.userId, refreshToken: tokens.refreshToken },
        refreshTokenExpiresIn,
        CACHE_PREFIX.REFRESH_TOKEN
      );
      
      // 使旧令牌失效
      await this.redisCacheService.delete(validTokenId, CACHE_PREFIX.ACCESS_TOKEN);
      await this.redisCacheService.delete(validTokenId, CACHE_PREFIX.REFRESH_TOKEN);
      
      // 更新用户令牌列表
      const updatedTokens: string[] = (existingTokens || []).filter(id => id !== validTokenId);
      updatedTokens.push(newTokenId);
      await this.redisCacheService.set(
        existingTokenKey,
        updatedTokens,
        refreshTokenExpiresIn
      );
      
      this.logger.info('刷新令牌成功', { userId, oldTokenId: validTokenId, newTokenId });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      this.logger.error('刷新令牌失败', { error: error.message });
      throw new UnauthorizedException('无效或过期的刷新令牌');
    }
  }
}