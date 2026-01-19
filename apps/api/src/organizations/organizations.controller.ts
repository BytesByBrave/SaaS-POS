import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Post()
    create(@Body() orgData: any) {
        return this.organizationsService.create(orgData);
    }

    @Get()
    findAll() {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(id);
    }
}
