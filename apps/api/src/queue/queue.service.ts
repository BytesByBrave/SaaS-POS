import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { QUEUE_NAMES } from './queue.module';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface ReportJobData {
  organizationId: string;
  reportType: 'daily-sales' | 'inventory' | 'top-items' | 'custom';
  dateRange: { start: Date; end: Date };
  email?: string;
}

export interface InventoryAlertJobData {
  organizationId: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.REPORTS) private reportsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.INVENTORY) private inventoryQueue: Queue,
  ) {}

  // Email Jobs
  async sendEmail(data: EmailJobData) {
    const job = await this.emailQueue.add('send', data, {
      priority: 1,
      attempts: 3,
    });
    this.logger.log(`Email job queued: ${job.id} to ${data.to}`);
    return job;
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail({
      to,
      subject: 'Welcome to SaaS POS',
      template: 'welcome',
      context: { name },
    });
  }

  async sendOrderConfirmation(to: string, orderId: string, total: number) {
    return this.sendEmail({
      to,
      subject: `Order Confirmation #${orderId}`,
      template: 'order-confirmation',
      context: { orderId, total },
    });
  }

  async sendPasswordReset(to: string, resetToken: string) {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: { resetToken },
    });
  }

  // Report Jobs
  async generateReport(data: ReportJobData) {
    const job = await this.reportsQueue.add('generate', data, {
      attempts: 2,
      timeout: 300000, // 5 minutes
    });
    this.logger.log(
      `Report job queued: ${job.id} for org ${data.organizationId}`,
    );
    return job;
  }

  async scheduleDailyReport(organizationId: string, email: string) {
    const job = await this.reportsQueue.add(
      'daily-summary',
      { organizationId, email },
      {
        repeat: { cron: '0 6 * * *' }, // Every day at 6 AM
      },
    );
    return job;
  }

  // Inventory Alert Jobs
  async sendInventoryAlert(data: InventoryAlertJobData) {
    const job = await this.inventoryQueue.add('low-stock-alert', data, {
      priority: 2,
    });
    this.logger.log(`Inventory alert queued for product: ${data.productName}`);
    return job;
  }

  async checkLowStockProducts(organizationId: string) {
    const job = await this.inventoryQueue.add('check-all', { organizationId });
    return job;
  }

  // Queue status methods
  async getEmailQueueStatus() {
    return {
      waiting: await this.emailQueue.getWaitingCount(),
      active: await this.emailQueue.getActiveCount(),
      completed: await this.emailQueue.getCompletedCount(),
      failed: await this.emailQueue.getFailedCount(),
    };
  }

  async getReportsQueueStatus() {
    return {
      waiting: await this.reportsQueue.getWaitingCount(),
      active: await this.reportsQueue.getActiveCount(),
      completed: await this.reportsQueue.getCompletedCount(),
      failed: await this.reportsQueue.getFailedCount(),
    };
  }
}
