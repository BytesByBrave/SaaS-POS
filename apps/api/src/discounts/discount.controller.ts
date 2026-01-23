import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DiscountService, OrderItem } from './discount.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Discount } from './entities/discount.entity';

@ApiTags('discounts')
@ApiBearerAuth()
@Controller('discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Validate a discount code and calculate discount amount',
  })
  async validate(
    @Body() body: { code: string; items: OrderItem[]; customerId?: string },
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.discountService.validateAndApply(
      organizationId,
      body.code,
      body.items,
      body.customerId,
    );
  }

  @Get('auto-apply')
  @ApiOperation({ summary: 'Get all auto-apply discounts' })
  async getAutoApply(@ActiveUser('organizationId') organizationId: string) {
    return this.discountService.getAutoApplyDiscounts(organizationId);
  }

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all discounts' })
  async findAll(@ActiveUser('organizationId') organizationId: string) {
    return this.discountService.findAll(organizationId);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get a specific discount' })
  async findOne(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.discountService.findOne(id, organizationId);
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new discount' })
  async create(
    @Body() data: Partial<Discount>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.discountService.create(organizationId, data);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update a discount' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Discount>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.discountService.update(id, organizationId, data);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a discount' })
  async delete(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.discountService.delete(id, organizationId);
  }
}
