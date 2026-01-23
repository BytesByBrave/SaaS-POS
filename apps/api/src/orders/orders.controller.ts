import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
  })
  async create(
    @Body() orderData: CreateOrderDto,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.ordersService.create(orderData, organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the organization' })
  async findAll(@ActiveUser('organizationId') organizationId: string) {
    return this.ordersService.findAll(organizationId);
  }

  @Get('analytics/sales-per-hour')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get sales per hour analytics' })
  async getSalesPerHour(@ActiveUser('organizationId') organizationId: string) {
    return this.ordersService.getSalesPerHour(organizationId);
  }

  @Get('analytics/top-items')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get top selling items analytics' })
  async getTopItems(@ActiveUser('organizationId') organizationId: string) {
    return this.ordersService.getTopItems(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  async findOne(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.ordersService.findOne(id, organizationId);
  }
}
