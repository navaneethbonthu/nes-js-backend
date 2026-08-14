import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import winston from 'winston/lib/winston/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/configs/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig)
  });


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that don't have decorators in DTO
    forbidNonWhitelisted: true, // Throws error if extra properties are sent
    transform: true // Automatically transforms payloads to DTO instances
  }))

  app.useGlobalFilters(new GlobalExceptionFilter())

  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
