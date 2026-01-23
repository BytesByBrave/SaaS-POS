import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import type { WebhookEvent } from './webhook.entity';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'webhook_id' })
  webhookId: string;

  @Column()
  event: WebhookEvent;

  @Column()
  url: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'jsonb', nullable: true })
  requestHeaders: Record<string, string>;

  @Column({ nullable: true })
  responseStatus: number;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ type: 'jsonb', nullable: true })
  responseHeaders: Record<string, string>;

  @Column()
  durationMs: number;

  @Column({ default: false })
  success: boolean;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ default: 0 })
  attemptNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
