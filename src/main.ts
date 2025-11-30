import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // 全局路由前缀
  const globalPrefix = configService.get('app.globalPrefix') || 'api';
  app.setGlobalPrefix(globalPrefix);

  // 跨域配置
  if (configService.get('app.cors')) {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      allowedHeaders: 'Content-Type, Accept, Authorization',
      optionsSuccessStatus: 204,
    });
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Get port from config
  const port = configService.get('app.port') || 3012;

  await app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
  });
}
bootstrap();
