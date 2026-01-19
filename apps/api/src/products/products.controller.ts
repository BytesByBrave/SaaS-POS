import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUser } from '../common/decorators/active-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() productData: any, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.create(productData, organizationId);
    }

    @Get()
    findAll(@ActiveUser('organizationId') organizationId: string) {
        return this.productsService.findAll(organizationId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.findOne(id, organizationId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() productData: any, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.update(id, productData, organizationId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @ActiveUser('organizationId') organizationId: string) {
        return this.productsService.remove(id, organizationId);
    }
}
