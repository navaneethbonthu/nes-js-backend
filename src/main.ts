import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { prototype } from 'events';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that don't have decorators in DTO
    forbidNonWhitelisted: true, // Throws error if extra properties are sent
    transform: true // Automatically transforms payloads to DTO instances
  }))

  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
