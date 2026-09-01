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
import { MailerModule } from '@nestjs-modules/mailer';
import { transport } from 'winston';
import { HealthModule } from './modules/health/health.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'development' ? `.env` : undefined,
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
          // 2. Wrap the values in Number() to ensure they aren't strings
          ttl: Number(config.get(CONFIG_KEYS.TTL_TIME)) || 60000,
          limit: Number(config.get(CONFIG_KEYS.THROTTLE_LIMIT)) || 10,
        },
      ],
    }),


    MailerModule.forRootAsync({

      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({

        transport: {
          host: config.getOrThrow(CONFIG_KEYS.MAIL_HOST),
          port: config.getOrThrow(CONFIG_KEYS.MAIL_PORT),
          auth: {
            user: config.getOrThrow(CONFIG_KEYS.MAIL_USER),
            pass: config.getOrThrow(CONFIG_KEYS.MAIL_PASSWORD)
          }
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
      }),
    }),


    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   inject: [ConfigService],
    //   useFactory: async (config: ConfigService) => ({
    //     store: await redisStore({
    //       socket: {
    //         host: config.getOrThrow(CONFIG_KEYS.REDIS_HOST),
    //         port: config.getOrThrow(CONFIG_KEYS.REDIS_PORT)
    //       },
    //       password: config.getOrThrow(CONFIG_KEYS.REDIS_PASSWORD)
    //     }),
    //     ttl: config.getOrThrow(CONFIG_KEYS.CACHE_TTL)

    //   })
    // }),

    PrismaModule,
    AuthModule,
    UserModule,
    HealthModule,
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
