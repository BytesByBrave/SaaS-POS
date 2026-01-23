import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async pull(
    entityName: string,
    organizationId: string,
    lastCheckpoint: any,
    limit: number,
  ) {
    const repository = this.getRepository(entityName);
    const updatedAt = lastCheckpoint?.updatedAt || 0;

    const items = await repository.find({
      where: {
        organizationId,
        updatedAt: MoreThan(new Date(updatedAt)),
      },
      order: { updatedAt: 'ASC' } as any,
      take: limit,
    });

    const newCheckpoint =
      items.length > 0
        ? { updatedAt: items[items.length - 1].updatedAt.getTime() }
        : lastCheckpoint;

    return {
      documents: items,
      checkpoint: newCheckpoint,
    };
  }

  async push(entityName: string, organizationId: string, changes: any[]) {
    const repository = this.getRepository(entityName);

    for (const change of changes) {
      const { newDocumentState } = change;
      // In a real app, handle conflicts here
      await repository.save({
        ...newDocumentState,
        organizationId,
      });
    }

    return { success: true };
  }

  private getRepository(entityName: string): Repository<any> {
    switch (entityName) {
      case 'orders':
        return this.ordersRepository;
      case 'products':
        return this.productsRepository;
      default:
        throw new Error(`Unknown entity: ${entityName}`);
    }
  }
}
