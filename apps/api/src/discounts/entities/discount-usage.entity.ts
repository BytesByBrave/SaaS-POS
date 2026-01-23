import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('discount_usages')
export class DiscountUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'discount_id' })
  discountId: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;
}
