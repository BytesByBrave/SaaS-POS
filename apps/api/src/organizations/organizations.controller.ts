import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create a new organization (Global Admin only)' })
    create(@Body() orgData: CreateOrganizationDto) {
        return this.organizationsService.create(orgData);
    }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Get all organizations (Global Admin only)' })
    findAll() {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an organization by ID' })
    findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(id);
    }
}
