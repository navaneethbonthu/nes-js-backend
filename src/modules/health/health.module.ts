import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator]
})
export class HealthModule { }
