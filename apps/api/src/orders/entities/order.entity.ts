import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @Column({ default: 'completed' })
    status: string;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @Column({ name: 'customer_id', nullable: true })
    customerId: string;
}
