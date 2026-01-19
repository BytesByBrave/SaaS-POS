import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUser } from '../common/decorators/active-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    async create(@Body() orderData: any, @ActiveUser('organizationId') organizationId: string) {
        return this.ordersService.create(orderData, organizationId);
    }

    @Get()
    async findAll(@ActiveUser('organizationId') organizationId: string) {
        return this.ordersService.findAll(organizationId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @ActiveUser('organizationId') organizationId: string) {
        return this.ordersService.findOne(id, organizationId);
    }
}
