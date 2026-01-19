import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(productData: any, organizationId: string): Promise<Product> {
        const product = this.productsRepository.create({
            ...productData,
            organizationId,
        } as Partial<Product>);
        return this.productsRepository.save(product);
    }

    async findAll(organizationId: string): Promise<Product[]> {
        return this.productsRepository.find({
            where: { organizationId },
        });
    }

    async findOne(id: string, organizationId: string): Promise<Product | null> {
        return this.productsRepository.findOne({
            where: { id, organizationId },
        });
    }

    async update(id: string, productData: any, organizationId: string): Promise<Product | null> {
        await this.productsRepository.update({ id, organizationId }, productData);
        return this.findOne(id, organizationId);
    }

    async remove(id: string, organizationId: string): Promise<void> {
        await this.productsRepository.delete({ id, organizationId });
    }

    async findLowStock(organizationId: string, threshold: number = 10): Promise<Product[]> {
        return this.productsRepository.find({
            where: {
                organizationId,
                stock: LessThan(threshold)
            }
        });
    }
}
