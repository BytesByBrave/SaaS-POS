import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y' | 'bundle';

@Entity('discounts')
export class Discount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 'percentage', length: 20 })
    type: DiscountType;

    @Column('decimal', { precision: 10, scale: 2 })
    value: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    minimumOrderAmount: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    maximumDiscountAmount: number;

    @Column({ type: 'simple-array', nullable: true })
    applicableProductIds: string[];

    @Column({ type: 'simple-array', nullable: true })
    applicableCategories: string[];

    @Column({ type: 'simple-array', nullable: true })
    excludedProductIds: string[];

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ nullable: true })
    usageLimit: number;

    @Column({ default: 0 })
    usageCount: number;

    @Column({ nullable: true })
    perCustomerLimit: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isAutoApply: boolean;

    @Column({ default: 1 })
    priority: number;

    @Column({ type: 'jsonb', nullable: true })
    conditions: {
        dayOfWeek?: number[];
        timeRange?: { start: string; end: string };
        minItems?: number;
        buyQuantity?: number;
        getQuantity?: number;
    };

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
