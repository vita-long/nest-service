import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '@/entities/user.entity';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RedisCacheModule } from '@/common/modules/cache/cache.module';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    UserModule,
    RedisCacheModule,
    MemberModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService) => {
        const algorithm = configService.get('jwt.algorithm') || 'HS256';
        return {
          secret: configService.get('jwt.secret'),
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn'),
            algorithm,
          },
          verifyOptions: {
            algorithms: [algorithm],
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}