import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRate } from './entities/tax-rate.entity';

export interface TaxCalculationRequest {
  items: Array<{
    productId?: string;
    category?: string;
    price: number;
    quantity: number;
  }>;
  region?: {
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
  };
}

export interface TaxCalculationResult {
  subtotal: number;
  taxAmount: number;
  total: number;
  breakdown: Array<{
    taxName: string;
    taxRate: number;
    taxAmount: number;
    applicableTo: string;
  }>;
}

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(
    @InjectRepository(TaxRate)
    private readonly taxRateRepository: Repository<TaxRate>,
  ) {}

  async calculateTax(
    organizationId: string,
    request: TaxCalculationRequest,
  ): Promise<TaxCalculationResult> {
    const subtotal = request.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Find applicable tax rates
    const taxRates = await this.findApplicableTaxRates(
      organizationId,
      request.region,
    );

    const breakdown: TaxCalculationResult['breakdown'] = [];
    let totalTax = 0;

    for (const item of request.items) {
      const itemTotal = item.price * item.quantity;

      for (const taxRate of taxRates) {
        // Check if tax applies to this category
        const appliesTo =
          !taxRate.applicableCategories ||
          taxRate.applicableCategories.length === 0 ||
          (item.category &&
            taxRate.applicableCategories.includes(item.category));

        if (appliesTo) {
          let taxAmount: number;

          if (taxRate.type === 'percentage') {
            if (taxRate.isInclusive) {
              // Tax-inclusive pricing
              taxAmount = itemTotal - itemTotal / (1 + taxRate.rate / 100);
            } else {
              taxAmount = itemTotal * (taxRate.rate / 100);
            }
          } else {
            // Fixed tax per item
            taxAmount = taxRate.rate * item.quantity;
          }

          const existingBreakdown = breakdown.find(
            (b) => b.taxName === taxRate.name,
          );
          if (existingBreakdown) {
            existingBreakdown.taxAmount += taxAmount;
          } else {
            breakdown.push({
              taxName: taxRate.name,
              taxRate: taxRate.rate,
              taxAmount,
              applicableTo: item.category || 'All Items',
            });
          }

          totalTax += taxAmount;
        }
      }
    }

    return {
      subtotal,
      taxAmount: Math.round(totalTax * 100) / 100,
      total: Math.round((subtotal + totalTax) * 100) / 100,
      breakdown,
    };
  }

  async findApplicableTaxRates(
    organizationId: string,
    region?: TaxCalculationRequest['region'],
  ): Promise<TaxRate[]> {
    const queryBuilder = this.taxRateRepository
      .createQueryBuilder('tax')
      .where('tax.organizationId = :organizationId', { organizationId })
      .andWhere('tax.isActive = true');

    if (region) {
      // Find most specific matching tax rate
      queryBuilder.andWhere(
        `(
          (tax.country = :country OR tax.country IS NULL) AND
          (tax.state = :state OR tax.state IS NULL) AND
          (tax.city = :city OR tax.city IS NULL) AND
          (tax.zipCode = :zipCode OR tax.zipCode IS NULL)
        )`,
        {
          country: region.country || '',
          state: region.state || '',
          city: region.city || '',
          zipCode: region.zipCode || '',
        },
      );
    }

    queryBuilder.orderBy('tax.isDefault', 'DESC');

    const rates = await queryBuilder.getMany();

    // If no specific rates found, return default
    if (rates.length === 0) {
      return this.taxRateRepository.find({
        where: { organizationId, isActive: true, isDefault: true },
      });
    }

    return rates;
  }

  async create(
    organizationId: string,
    data: Partial<TaxRate>,
  ): Promise<TaxRate> {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.taxRateRepository.update(
        { organizationId, isDefault: true },
        { isDefault: false },
      );
    }

    const taxRate = this.taxRateRepository.create({
      ...data,
      organizationId,
    });
    return this.taxRateRepository.save(taxRate);
  }

  async findAll(organizationId: string): Promise<TaxRate[]> {
    return this.taxRateRepository.find({
      where: { organizationId },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<TaxRate | null> {
    return this.taxRateRepository.findOne({
      where: { id, organizationId },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<TaxRate>,
  ): Promise<TaxRate | null> {
    if (data.isDefault) {
      await this.taxRateRepository.update(
        { organizationId, isDefault: true },
        { isDefault: false },
      );
    }

    await this.taxRateRepository.update({ id, organizationId }, data);
    return this.findOne(id, organizationId);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.taxRateRepository.delete({ id, organizationId });
  }
}
