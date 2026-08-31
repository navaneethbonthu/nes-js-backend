import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {

    constructor(private prisma: PrismaService) {
        super()
    }


    async isHealty(key: string): Promise<HealthIndicatorResult> {
        try {
            // We run a simple query to see if the DB is alive
            await this.prisma.$queryRaw`select 1`
            return this.getStatus(key, true)
        } catch (e) {
            throw new HealthCheckError('Prisma check failed', this.getStatus(key, false))
        }
    }

}

