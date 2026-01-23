import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import type { TaxCalculationRequest } from './tax.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { TaxRate } from './entities/tax-rate.entity';

@ApiTags('tax')
@ApiBearerAuth()
@Controller('tax')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate tax for order items' })
  async calculate(
    @Body() request: TaxCalculationRequest,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.taxService.calculateTax(organizationId, request);
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get all tax rates for organization' })
  async findAll(@ActiveUser('organizationId') organizationId: string) {
    return this.taxService.findAll(organizationId);
  }

  @Get('rates/:id')
  @ApiOperation({ summary: 'Get a specific tax rate' })
  async findOne(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.taxService.findOne(id, organizationId);
  }

  @Post('rates')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new tax rate' })
  async create(
    @Body() data: Partial<TaxRate>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.taxService.create(organizationId, data);
  }

  @Put('rates/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update a tax rate' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<TaxRate>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.taxService.update(id, organizationId, data);
  }

  @Delete('rates/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a tax rate' })
  async delete(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.taxService.delete(id, organizationId);
  }
}
