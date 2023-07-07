import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  // app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: 'localhost:3000',
    credentials: true,
  });

  await app.listen(
    configService.get('PORT') ? parseInt(configService.get('PORT')) : 3000,
  );
}

bootstrap();
