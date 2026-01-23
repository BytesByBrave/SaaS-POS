import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    memory: HealthCheckResult;
  };
}

interface HealthCheckResult {
  status: 'up' | 'down';
  latency?: number;
  message?: string;
  details?: any;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for Kubernetes/load balancers' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to accept traffic',
  })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready(): Promise<HealthCheckResponse> {
    const checks = await this.runHealthChecks();
    const isHealthy = Object.values(checks).every(
      (check) => check.status === 'up',
    );
    const isDegraded = Object.values(checks).some(
      (check) => check.status === 'down',
    );

    return {
      status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.1',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async live(): Promise<{ status: string; uptime: number }> {
    return {
      status: 'alive',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  private async runHealthChecks(): Promise<{
    database: HealthCheckResult;
    memory: HealthCheckResult;
  }> {
    return {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - start;

      return {
        status: 'up',
        latency,
        message: 'Database connection is healthy',
      };
    } catch (error) {
      return {
        status: 'down',
        message: 'Database connection failed',
        details:
          process.env.NODE_ENV !== 'production' ? error.message : undefined,
      };
    }
  }

  private checkMemory(): HealthCheckResult {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const usagePercent = Math.round((used.heapUsed / used.heapTotal) * 100);

    return {
      status: usagePercent < 90 ? 'up' : 'down',
      message: `Memory usage: ${usagePercent}%`,
      details: {
        heapUsedMB,
        heapTotalMB,
        usagePercent,
        rssMB: Math.round(used.rss / 1024 / 1024),
      },
    };
  }
}
