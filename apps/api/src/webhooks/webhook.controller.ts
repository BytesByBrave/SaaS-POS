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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Webhook } from './entities/webhook.entity';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get('events')
  @ApiOperation({ summary: 'Get available webhook events' })
  getEvents() {
    return this.webhookService.getAvailableEvents();
  }

  @Get()
  @ApiOperation({ summary: 'Get all webhooks' })
  async findAll(@ActiveUser('organizationId') organizationId: string) {
    return this.webhookService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific webhook' })
  async findOne(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.webhookService.findOne(id, organizationId);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get webhook delivery logs' })
  async getLogs(
    @Param('id') id: string,
    @Query('limit') limit: number = 50,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.webhookService.getLogs(id, organizationId, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new webhook' })
  async create(
    @Body() data: Partial<Webhook>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.webhookService.create(organizationId, data);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Send a test webhook' })
  async test(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.webhookService.test(id, organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Webhook>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.webhookService.update(id, organizationId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  async delete(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.webhookService.delete(id, organizationId);
  }
}
