import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import winston from 'winston/lib/winston/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/configs/winston.config';
import * as express from 'express'
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { CONFIG_KEYS } from './common/constants/config.keys';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    // {
    // logger: WinstonModule.createLogger(winstonConfig)
    // }
  );
  app.use(cookieParser())

  // 1. Get ConfigService to access environment variables
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>(CONFIG_KEYS.FRONTEND_URL);

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  })

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that don't have decorators in DTO
    forbidNonWhitelisted: true, // Throws error if extra properties are sent
    transform: true // Automatically transforms payloads to DTO instances
  }))

  app.useGlobalFilters(new GlobalExceptionFilter())


  await app.listen(configService.get<number>(CONFIG_KEYS.PORT) || 3000);
}
bootstrap();

