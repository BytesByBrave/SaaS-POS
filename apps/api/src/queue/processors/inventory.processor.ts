import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import { InventoryAlertJobData, QueueService } from '../queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Processor(QUEUE_NAMES.INVENTORY)
export class InventoryProcessor {
    private readonly logger = new Logger(InventoryProcessor.name);

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    @Process('low-stock-alert')
    async handleLowStockAlert(job: Job<InventoryAlertJobData>) {
        const { productName, currentStock, threshold } = job.data;

        this.logger.warn(
            `LOW STOCK ALERT: ${productName} has ${currentStock} items (threshold: ${threshold})`,
        );

        // In production, this would:
        // 1. Send email notification to admins
        // 2. Create a notification in the admin dashboard
        // 3. Potentially trigger auto-reorder if configured

        return {
            alerted: true,
            productName,
            currentStock,
            threshold,
            timestamp: new Date().toISOString(),
        };
    }

    @Process('check-all')
    async handleCheckAll(job: Job<{ organizationId: string }>) {
        const { organizationId } = job.data;

        this.logger.log(`Checking inventory for organization: ${organizationId}`);

        // Find all products below threshold
        const lowStockProducts = await this.productRepository
            .createQueryBuilder('product')
            .where('product.organizationId = :organizationId', { organizationId })
            .andWhere('product.stock <= product.lowStockThreshold')
            .andWhere('product.isActive = true')
            .getMany();

        const alerts: any[] = [];

        for (const product of lowStockProducts) {
            alerts.push({
                productId: product.id,
                productName: product.name,
                currentStock: product.stock,
                threshold: (product as any).lowStockThreshold || 10,
            });
        }

        this.logger.log(`Found ${alerts.length} products with low stock`);

        return {
            organizationId,
            alertCount: alerts.length,
            products: alerts,
            checkedAt: new Date().toISOString(),
        };
    }

    @Process('update-stock')
    async handleUpdateStock(
        job: Job<{ productId: string; organizationId: string; adjustment: number }>,
    ) {
        const { productId, organizationId, adjustment } = job.data;

        const product = await this.productRepository.findOne({
            where: { id: productId, organizationId },
        });

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        const newStock = product.stock + adjustment;

        await this.productRepository.update(
            { id: productId, organizationId },
            { stock: Math.max(0, newStock) },
        );

        // Check if stock is now low
        const lowStockThreshold = (product as any).lowStockThreshold || 10;
        if (newStock <= lowStockThreshold && newStock >= 0) {
            this.logger.warn(`Product ${product.name} is now at low stock: ${newStock}`);
        }

        return {
            productId,
            previousStock: product.stock,
            adjustment,
            newStock: Math.max(0, newStock),
        };
    }

    @OnQueueCompleted()
    onCompleted(job: Job) {
        this.logger.log(`Inventory job ${job.id} completed`);
    }

    @OnQueueFailed()
    onFailed(job: Job, error: Error) {
        this.logger.error(`Inventory job ${job.id} failed: ${error.message}`);
    }
}
