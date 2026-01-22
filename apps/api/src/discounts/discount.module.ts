import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { Discount } from './entities/discount.entity';
import { DiscountUsage } from './entities/discount-usage.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Discount, DiscountUsage])],
    providers: [DiscountService],
    controllers: [DiscountController],
    exports: [DiscountService],
})
export class DiscountModule { }
