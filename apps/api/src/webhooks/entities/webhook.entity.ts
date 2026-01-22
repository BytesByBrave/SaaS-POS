import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type WebhookEvent =
    | 'order.created'
    | 'order.updated'
    | 'order.completed'
    | 'order.cancelled'
    | 'product.created'
    | 'product.updated'
    | 'product.deleted'
    | 'product.low_stock'
    | 'customer.created'
    | 'customer.updated'
    | 'payment.success'
    | 'payment.failed'
    | 'user.created'
    | 'user.login';

@Entity('webhooks')
export class Webhook {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column({ type: 'simple-array' })
    events: WebhookEvent[];

    @Column({ nullable: true })
    secret: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    headers: Record<string, string>;

    @Column({ default: 3 })
    retryCount: number;

    @Column({ default: 30000 })
    timeoutMs: number;

    @Column({ default: 0 })
    failureCount: number;

    @Column({ nullable: true })
    lastTriggeredAt: Date;

    @Column({ nullable: true })
    lastSuccessAt: Date;

    @Column({ nullable: true })
    lastFailureAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
