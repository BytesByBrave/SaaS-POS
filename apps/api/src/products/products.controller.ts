import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
    create(@Body() productData: CreateProductDto, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.create(productData, organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products for the current organization' })
    findAll(@ActiveUser('organizationId') organizationId: string) {
        return this.productsService.findAll(organizationId);
    }

    @Get('low-stock')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Get low stock products' })
    getLowStock(@Headers('x-threshold') threshold: string, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.findLowStock(organizationId, parseInt(threshold) || 10);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    findOne(@Param('id') id: string, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.findOne(id, organizationId);
    }

    @Patch(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Update a product' })
    update(@Param('id') id: string, @Body() productData: Partial<CreateProductDto>, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.update(id, productData, organizationId);
    }

    @Delete(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Delete a product' })
    remove(@Param('id') id: string, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.remove(id, organizationId);
    }
}
