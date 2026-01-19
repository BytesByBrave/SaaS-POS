import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
    ) { }

    async create(orderData: any, organizationId: string): Promise<Order> {
        const order = this.ordersRepository.create({
            total: orderData.total,
            status: orderData.status || 'completed',
            customerId: orderData.customerId,
            organizationId,
        });

        if (orderData.items && Array.isArray(orderData.items)) {
            order.items = orderData.items.map((item: any) =>
                this.orderItemsRepository.create({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    organizationId,
                }),
            );
        }

        return this.ordersRepository.save(order);
    }

    async findAll(organizationId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { organizationId },
            relations: ['items'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, organizationId: string): Promise<Order | null> {
        return this.ordersRepository.findOne({
            where: { id, organizationId },
            relations: ['items'],
        });
    }
}
