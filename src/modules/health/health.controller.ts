import { Controller, Get } from '@nestjs/common';
import { DiskHealthIndicator, HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@Controller('health')
export class HealthController {

    constructor(
        private healt: HealthCheckService,
        private db: PrismaHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator
    ) { }



    @Get()
    @HealthCheck()
    check() {
        return this.healt.check([
            () => this.db.isHealty('database'),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', { thresholdPercent: 0.9, path: process.platform === 'win32' ? 'c:\\' : '/' })
        ])
    }
}
