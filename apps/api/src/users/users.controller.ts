import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    create(@Body() userData: CreateUserDto, @ActiveUser('organizationId') organizationId: string) {
        return this.usersService.create(userData, organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users in the organization' })
    findAll(@ActiveUser('organizationId') organizationId: string) {
        return this.usersService.findAllByOrganization(organizationId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific user by ID' })
    findOne(@Param('id') id: string, @ActiveUser('organizationId') organizationId: string) {
        return this.usersService.findOneById(id, organizationId);
    }
}
