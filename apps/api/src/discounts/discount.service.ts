import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { Discount, DiscountType } from './entities/discount.entity';
import { DiscountUsage } from './entities/discount-usage.entity';

export interface OrderItem {
    productId?: string;
    productName: string;
    category?: string;
    price: number;
    quantity: number;
}

export interface DiscountValidationResult {
    valid: boolean;
    discount?: Discount;
    discountAmount: number;
    message?: string;
    appliedTo?: string[];
}

@Injectable()
export class DiscountService {
    private readonly logger = new Logger(DiscountService.name);

    constructor(
        @InjectRepository(Discount)
        private readonly discountRepository: Repository<Discount>,
        @InjectRepository(DiscountUsage)
        private readonly usageRepository: Repository<DiscountUsage>,
    ) { }

    async validateAndApply(
        organizationId: string,
        code: string,
        items: OrderItem[],
        customerId?: string,
    ): Promise<DiscountValidationResult> {
        const discount = await this.discountRepository.findOne({
            where: { organizationId, code: code.toUpperCase() },
        });

        if (!discount) {
            return { valid: false, discountAmount: 0, message: 'Invalid discount code' };
        }

        // Check if active
        if (!discount.isActive) {
            return { valid: false, discountAmount: 0, message: 'This discount is no longer active' };
        }

        // Check date validity
        const now = new Date();
        if (discount.startDate && now < discount.startDate) {
            return { valid: false, discountAmount: 0, message: 'This discount is not yet active' };
        }
        if (discount.endDate && now > discount.endDate) {
            return { valid: false, discountAmount: 0, message: 'This discount has expired' };
        }

        // Check usage limit
        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
            return { valid: false, discountAmount: 0, message: 'This discount has reached its usage limit' };
        }

        // Check per-customer limit
        if (customerId && discount.perCustomerLimit) {
            const customerUsage = await this.usageRepository.count({
                where: { discountId: discount.id, customerId },
            });
            if (customerUsage >= discount.perCustomerLimit) {
                return { valid: false, discountAmount: 0, message: 'You have already used this discount the maximum number of times' };
            }
        }

        // Check time-based conditions
        if (discount.conditions?.dayOfWeek) {
            const dayOfWeek = now.getDay();
            if (!discount.conditions.dayOfWeek.includes(dayOfWeek)) {
                return { valid: false, discountAmount: 0, message: 'This discount is not valid today' };
            }
        }

        if (discount.conditions?.timeRange) {
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            if (currentTime < discount.conditions.timeRange.start || currentTime > discount.conditions.timeRange.end) {
                return { valid: false, discountAmount: 0, message: 'This discount is not valid at this time' };
            }
        }

        // Calculate applicable items
        const applicableItems = this.getApplicableItems(discount, items);
        if (applicableItems.length === 0) {
            return { valid: false, discountAmount: 0, message: 'No items in your cart are eligible for this discount' };
        }

        // Check minimum order amount
        const applicableSubtotal = applicableItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );
        if (discount.minimumOrderAmount && applicableSubtotal < discount.minimumOrderAmount) {
            return {
                valid: false,
                discountAmount: 0,
                message: `Minimum order amount of $${discount.minimumOrderAmount} required for this discount`,
            };
        }

        // Check minimum items condition
        const totalItems = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
        if (discount.conditions?.minItems && totalItems < discount.conditions.minItems) {
            return {
                valid: false,
                discountAmount: 0,
                message: `Minimum ${discount.conditions.minItems} items required for this discount`,
            };
        }

        // Calculate discount amount
        const discountAmount = this.calculateDiscountAmount(discount, applicableItems, applicableSubtotal);

        return {
            valid: true,
            discount,
            discountAmount,
            appliedTo: applicableItems.map((i) => i.productName),
        };
    }

    private getApplicableItems(discount: Discount, items: OrderItem[]): OrderItem[] {
        return items.filter((item) => {
            // Check if excluded
            if (discount.excludedProductIds?.includes(item.productId || '')) {
                return false;
            }

            // If specific products are specified
            if (discount.applicableProductIds?.length > 0) {
                return discount.applicableProductIds.includes(item.productId || '');
            }

            // If specific categories are specified
            if (discount.applicableCategories?.length > 0) {
                return item.category && discount.applicableCategories.includes(item.category);
            }

            // Otherwise applies to all
            return true;
        });
    }

    private calculateDiscountAmount(
        discount: Discount,
        items: OrderItem[],
        subtotal: number,
    ): number {
        let discountAmount: number;

        switch (discount.type) {
            case 'percentage':
                discountAmount = subtotal * (discount.value / 100);
                break;

            case 'fixed':
                discountAmount = Math.min(discount.value, subtotal);
                break;

            case 'buy_x_get_y':
                // Buy X get Y free
                const buyQty = discount.conditions?.buyQuantity || 1;
                const getQty = discount.conditions?.getQuantity || 1;
                const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
                const sets = Math.floor(totalQty / (buyQty + getQty));
                // Get cheapest items as free
                const sortedPrices = items
                    .flatMap((i) => Array(i.quantity).fill(i.price))
                    .sort((a, b) => a - b);
                discountAmount = sortedPrices.slice(0, sets * getQty).reduce((a, b) => a + b, 0);
                break;

            case 'bundle':
                // Bundle deals - simplified: if all required items present, apply discount
                discountAmount = discount.value;
                break;

            default:
                discountAmount = 0;
        }

        // Apply maximum discount cap
        if (discount.maximumDiscountAmount) {
            discountAmount = Math.min(discountAmount, discount.maximumDiscountAmount);
        }

        return Math.round(discountAmount * 100) / 100;
    }

    async recordUsage(
        organizationId: string,
        discountId: string,
        orderId: string,
        discountAmount: number,
        customerId?: string,
    ): Promise<void> {
        // Record usage
        const usage = this.usageRepository.create({
            organizationId,
            discountId,
            orderId,
            customerId,
            discountAmount,
        });
        await this.usageRepository.save(usage);

        // Increment usage count
        await this.discountRepository.increment({ id: discountId }, 'usageCount', 1);
    }

    async getAutoApplyDiscounts(organizationId: string): Promise<Discount[]> {
        const now = new Date();
        return this.discountRepository.find({
            where: {
                organizationId,
                isActive: true,
                isAutoApply: true,
            },
            order: { priority: 'DESC' },
        });
    }

    // CRUD operations
    async create(organizationId: string, data: Partial<Discount>): Promise<Discount> {
        // Generate code if not provided
        if (!data.code) {
            data.code = this.generateCode();
        }
        data.code = data.code.toUpperCase();

        const discount = this.discountRepository.create({
            ...data,
            organizationId,
        });
        return this.discountRepository.save(discount);
    }

    async findAll(organizationId: string): Promise<Discount[]> {
        return this.discountRepository.find({
            where: { organizationId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, organizationId: string): Promise<Discount | null> {
        return this.discountRepository.findOne({
            where: { id, organizationId },
        });
    }

    async update(id: string, organizationId: string, data: Partial<Discount>): Promise<Discount | null> {
        if (data.code) {
            data.code = data.code.toUpperCase();
        }
        await this.discountRepository.update({ id, organizationId }, data);
        return this.findOne(id, organizationId);
    }

    async delete(id: string, organizationId: string): Promise<void> {
        await this.discountRepository.delete({ id, organizationId });
    }

    private generateCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}
