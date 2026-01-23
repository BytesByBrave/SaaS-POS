import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { ReportProcessor } from './processors/report.processor';
import { InventoryProcessor } from './processors/inventory.processor';
import { QueueService } from './queue.service';

export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  REPORTS: 'reports-queue',
  INVENTORY: 'inventory-queue',
  SYNC: 'sync-queue',
} as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host', 'localhost'),
          port: configService.get('redis.port', 6379),
          password: configService.get('redis.password') || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.REPORTS },
      { name: QUEUE_NAMES.INVENTORY },
      { name: QUEUE_NAMES.SYNC },
    ),
  ],
  providers: [
    QueueService,
    EmailProcessor,
    ReportProcessor,
    InventoryProcessor,
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
