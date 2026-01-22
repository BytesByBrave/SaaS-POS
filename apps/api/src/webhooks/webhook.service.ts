import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook, WebhookEvent } from './entities/webhook.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import * as crypto from 'crypto';

export interface WebhookPayload {
    event: WebhookEvent;
    timestamp: string;
    data: any;
}

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(
        @InjectRepository(Webhook)
        private readonly webhookRepository: Repository<Webhook>,
        @InjectRepository(WebhookLog)
        private readonly logRepository: Repository<WebhookLog>,
    ) { }

    // Trigger webhooks for an event
    async trigger(organizationId: string, event: WebhookEvent, data: any): Promise<void> {
        const webhooks = await this.webhookRepository.find({
            where: { organizationId, isActive: true },
        });

        const relevantWebhooks = webhooks.filter((w) => w.events.includes(event));

        if (relevantWebhooks.length === 0) {
            return;
        }

        this.logger.log(`Triggering ${relevantWebhooks.length} webhooks for event: ${event}`);

        // Fire webhooks asynchronously
        for (const webhook of relevantWebhooks) {
            this.deliverWebhook(webhook, event, data).catch((error) => {
                this.logger.error(`Failed to deliver webhook ${webhook.id}: ${error.message}`);
            });
        }
    }

    private async deliverWebhook(
        webhook: Webhook,
        event: WebhookEvent,
        data: any,
        attemptNumber: number = 1,
    ): Promise<void> {
        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            data,
        };

        const signature = this.generateSignature(payload, webhook.secret);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event,
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': payload.timestamp,
            'X-Webhook-Id': webhook.id,
            'User-Agent': 'SaaS-POS-Webhook/1.0',
            ...webhook.headers,
        };

        const startTime = Date.now();
        let success = false;
        let responseStatus: number | undefined;
        let responseBody: string | undefined;
        let errorMessage: string | undefined;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), webhook.timeoutMs);

            const response = await fetch(webhook.url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            responseStatus = response.status;
            responseBody = await response.text();
            success = response.ok;

            if (!success) {
                errorMessage = `HTTP ${responseStatus}: ${responseBody.substring(0, 500)}`;
            }
        } catch (error) {
            errorMessage = error.message;
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out';
            }
        }

        const durationMs = Date.now() - startTime;

        // Log the attempt
        await this.logRepository.save({
            organizationId: webhook.organizationId,
            webhookId: webhook.id,
            event,
            url: webhook.url,
            payload,
            requestHeaders: headers,
            responseStatus,
            responseBody: responseBody?.substring(0, 10000), // Limit stored response
            durationMs,
            success,
            errorMessage,
            attemptNumber,
        });

        // Update webhook stats
        await this.webhookRepository.update(webhook.id, {
            lastTriggeredAt: new Date(),
            ...(success
                ? { lastSuccessAt: new Date(), failureCount: 0 }
                : { lastFailureAt: new Date(), failureCount: webhook.failureCount + 1 }),
        });

        // Retry on failure
        if (!success && attemptNumber < webhook.retryCount) {
            const delay = Math.pow(2, attemptNumber) * 1000; // Exponential backoff
            this.logger.log(`Retrying webhook ${webhook.id} in ${delay}ms (attempt ${attemptNumber + 1})`);

            setTimeout(() => {
                this.deliverWebhook(webhook, event, data, attemptNumber + 1);
            }, delay);
        } else if (!success) {
            this.logger.error(`Webhook ${webhook.id} failed after ${attemptNumber} attempts`);

            // Disable webhook after too many consecutive failures
            if (webhook.failureCount >= 10) {
                await this.webhookRepository.update(webhook.id, { isActive: false });
                this.logger.warn(`Webhook ${webhook.id} disabled due to repeated failures`);
            }
        }
    }

    private generateSignature(payload: WebhookPayload, secret?: string): string {
        if (!secret) {
            return '';
        }
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        return `sha256=${hmac.digest('hex')}`;
    }

    // Verify incoming webhook signature
    verifySignature(payload: string, signature: string, secret: string): boolean {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(payload);
        const expectedSignature = `sha256=${hmac.digest('hex')}`;
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }

    // CRUD Operations
    async create(organizationId: string, data: Partial<Webhook>): Promise<Webhook> {
        // Generate secret if not provided
        if (!data.secret) {
            data.secret = crypto.randomBytes(32).toString('hex');
        }

        const webhook = this.webhookRepository.create({
            ...data,
            organizationId,
        });
        return this.webhookRepository.save(webhook);
    }

    async findAll(organizationId: string): Promise<Webhook[]> {
        return this.webhookRepository.find({
            where: { organizationId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, organizationId: string): Promise<Webhook | null> {
        return this.webhookRepository.findOne({
            where: { id, organizationId },
        });
    }

    async update(id: string, organizationId: string, data: Partial<Webhook>): Promise<Webhook | null> {
        await this.webhookRepository.update({ id, organizationId }, data);
        return this.findOne(id, organizationId);
    }

    async delete(id: string, organizationId: string): Promise<void> {
        await this.webhookRepository.delete({ id, organizationId });
    }

    // Logs
    async getLogs(
        webhookId: string,
        organizationId: string,
        limit: number = 50,
    ): Promise<WebhookLog[]> {
        return this.logRepository.find({
            where: { webhookId, organizationId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    // Test webhook
    async test(id: string, organizationId: string): Promise<{ success: boolean; message: string }> {
        const webhook = await this.findOne(id, organizationId);
        if (!webhook) {
            return { success: false, message: 'Webhook not found' };
        }

        const testData = {
            type: 'test',
            message: 'This is a test webhook delivery',
            timestamp: new Date().toISOString(),
        };

        await this.deliverWebhook(webhook, 'order.created' as WebhookEvent, testData);

        return { success: true, message: 'Test webhook sent' };
    }

    // Get available events
    getAvailableEvents(): { event: WebhookEvent; description: string }[] {
        return [
            { event: 'order.created', description: 'When a new order is created' },
            { event: 'order.updated', description: 'When an order is updated' },
            { event: 'order.completed', description: 'When an order is completed' },
            { event: 'order.cancelled', description: 'When an order is cancelled' },
            { event: 'product.created', description: 'When a new product is created' },
            { event: 'product.updated', description: 'When a product is updated' },
            { event: 'product.deleted', description: 'When a product is deleted' },
            { event: 'product.low_stock', description: 'When a product reaches low stock threshold' },
            { event: 'customer.created', description: 'When a new customer is created' },
            { event: 'customer.updated', description: 'When a customer is updated' },
            { event: 'payment.success', description: 'When a payment is successful' },
            { event: 'payment.failed', description: 'When a payment fails' },
            { event: 'user.created', description: 'When a new user is created' },
            { event: 'user.login', description: 'When a user logs in' },
        ];
    }
}
