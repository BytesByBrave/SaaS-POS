import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import { ReportJobData } from '../queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Processor(QUEUE_NAMES.REPORTS)
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<ReportJobData>) {
    this.logger.log(
      `Generating ${job.data.reportType} report for org ${job.data.organizationId}`,
    );

    try {
      const { organizationId, reportType, dateRange } = job.data;

      let reportData: any;

      switch (reportType) {
        case 'daily-sales':
          reportData = await this.generateDailySalesReport(
            organizationId,
            dateRange,
          );
          break;
        case 'inventory':
          reportData = await this.generateInventoryReport(organizationId);
          break;
        case 'top-items':
          reportData = await this.generateTopItemsReport(
            organizationId,
            dateRange,
          );
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      this.logger.log(
        `Report generated successfully for org ${organizationId}`,
      );
      return reportData;
    } catch (error) {
      this.logger.error(`Failed to generate report:`, error.message);
      throw error;
    }
  }

  @Process('daily-summary')
  async handleDailySummary(
    job: Job<{ organizationId: string; email: string }>,
  ) {
    const { organizationId, email } = job.data;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const report = await this.generateDailySalesReport(organizationId, {
      start: yesterday,
      end: today,
    });

    // In a real implementation, this would send an email with the report
    this.logger.log(
      `Daily summary sent to ${email}: ${JSON.stringify(report)}`,
    );
    return report;
  }

  private async generateDailySalesReport(
    organizationId: string,
    dateRange: { start: Date; end: Date },
  ) {
    const orders = await this.orderRepository.find({
      where: {
        organizationId,
        createdAt: Between(dateRange.start, dateRange.end),
        status: 'completed',
      },
      relations: ['items'],
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by hour
    const salesByHour: Record<number, { count: number; total: number }> = {};
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      if (!salesByHour[hour]) {
        salesByHour[hour] = { count: 0, total: 0 };
      }
      salesByHour[hour].count++;
      salesByHour[hour].total += Number(order.total);
    });

    // Peak hour
    let peakHour = 0;
    let peakSales = 0;
    Object.entries(salesByHour).forEach(([hour, data]) => {
      if (data.total > peakSales) {
        peakHour = parseInt(hour);
        peakSales = data.total;
      }
    });

    return {
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        peakHour: `${peakHour}:00`,
        peakSales,
      },
      salesByHour,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateInventoryReport(organizationId: string) {
    // This would typically fetch from products service
    return {
      organizationId,
      type: 'inventory',
      generatedAt: new Date().toISOString(),
      message: 'Inventory report generated',
    };
  }

  private async generateTopItemsReport(
    organizationId: string,
    dateRange: { start: Date; end: Date },
  ) {
    const orders = await this.orderRepository.find({
      where: {
        organizationId,
        createdAt: Between(dateRange.start, dateRange.end),
      },
      relations: ['items'],
    });

    // Aggregate items
    const itemStats: Record<string, { quantity: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items?.forEach((item: any) => {
        const key = item.productName || item.productId;
        if (!itemStats[key]) {
          itemStats[key] = { quantity: 0, revenue: 0 };
        }
        itemStats[key].quantity += item.quantity;
        itemStats[key].revenue += Number(
          item.totalPrice || item.price * item.quantity,
        );
      });
    });

    // Sort and get top 10
    const topItems = Object.entries(itemStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      topItems,
      generatedAt: new Date().toISOString(),
    };
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Report job ${job.id} completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Report job ${job.id} failed: ${error.message}`);
  }
}
