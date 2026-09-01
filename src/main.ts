// import 'module-alias/register';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ConfigService } from '@nestjs/config';
// import { ValidationPipe } from '@nestjs/common';
// import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
// import winston from 'winston/lib/winston/config';
// import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from './common/configs/winston.config';
// import * as express from 'express'
// import { join } from 'path';
// import cookieParser from 'cookie-parser';
// import { CONFIG_KEYS } from './common/constants/config.keys';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule,
//     // {
//     // logger: WinstonModule.createLogger(winstonConfig)
//     // }
//   );
//   app.use(cookieParser())

//   // 1. Get ConfigService to access environment variables
//   const configService = app.get(ConfigService);
//   const frontendUrl = configService.get<string>(CONFIG_KEYS.FRONTEND_URL);

//   app.enableCors({
//     origin: frontendUrl,
//     methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
//     credintials: true,
//     allowedHeaders: 'Content-Type, Accept, Authorization',
//   })

//   app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true, // Strips away properties that don't have decorators in DTO
//     forbidNonWhitelisted: true, // Throws error if extra properties are sent
//     transform: true // Automatically transforms payloads to DTO instances
//   }))

//   app.useGlobalFilters(new GlobalExceptionFilter())


//   await app.listen(configService.get<number>(CONFIG_KEYS.PORT) || 3000);
// }
// bootstrap();


import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { CONFIG_KEYS } from './common/constants/config.keys';

// 1. Create the Express server instance
const server = express();

export const bootstrap = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>(CONFIG_KEYS.FRONTEND_URL);

  // Fix typo: credentials (not credintials)
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Note: Static uploads folder is read-only on Vercel
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Important for Vercel: Initialize the app but don't call listen()
  await app.init();
  return app;
};

// 2. Vercel Handler: This is what Vercel's Serverless Function calls
export default async (req: any, res: any) => {
  await bootstrap(server);
  return server(req, res);
};

// 3. Local Development Support: Only runs on your computer
if (process.env.NODE_ENV !== 'production') {
  const localServer = express();
  bootstrap(localServer).then(async (app) => {
    const configService = app.get(ConfigService);
    const port = configService.get<number>(CONFIG_KEYS.PORT) || 3000;
    await app.listen(port);
    console.log(`Application is running locally on: http://localhost:${port}`);
  });
}
