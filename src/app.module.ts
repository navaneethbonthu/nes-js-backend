import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { CONFIG_KEYS } from './common/constants/config.keys';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'development' ? `.env` : `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      validationSchema: Joi.object({
        [CONFIG_KEYS.PORT]: Joi.number().default(3000),
        [CONFIG_KEYS.DATABASE_URL]: Joi.string().required(),
        [CONFIG_KEYS.NODE_ENV]: Joi.string().valid('development', 'production', 'staging').default('development')
      })
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow<number>(CONFIG_KEYS.TTL_TIME),
          limit: config.getOrThrow<number>(CONFIG_KEYS.THROTTLE_LIMIT),
        },
      ],
    }),

    PrismaModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
