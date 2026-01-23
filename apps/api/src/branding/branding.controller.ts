import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { BrandingService } from './branding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { OrganizationBranding } from './entities/organization-branding.entity';
import { ReceiptTemplate } from './entities/receipt-template.entity';

@ApiTags('branding')
@ApiBearerAuth()
@Controller('branding')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  // Organization Branding
  @Get()
  @ApiOperation({ summary: 'Get organization branding' })
  async getBranding(@ActiveUser('organizationId') organizationId: string) {
    return this.brandingService.getBranding(organizationId);
  }

  @Put()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update organization branding' })
  async updateBranding(
    @Body() data: Partial<OrganizationBranding>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.brandingService.updateBranding(organizationId, data);
  }

  @Get('css')
  @ApiOperation({ summary: 'Get CSS variables for theming' })
  async getCssVariables(
    @ActiveUser('organizationId') organizationId: string,
    @Res() res: Response,
  ) {
    const branding = await this.brandingService.getBranding(organizationId);
    const css = this.brandingService.generateCssVariables(branding);
    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  }

  // Receipt Templates
  @Get('templates')
  @ApiOperation({ summary: 'Get all receipt templates' })
  async getTemplates(@ActiveUser('organizationId') organizationId: string) {
    return this.brandingService.getTemplates(organizationId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a specific receipt template' })
  async getTemplate(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.brandingService.getTemplate(id, organizationId);
  }

  @Post('templates')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new receipt template' })
  async createTemplate(
    @Body() data: Partial<ReceiptTemplate>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.brandingService.createTemplate(organizationId, data);
  }

  @Put('templates/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update a receipt template' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() data: Partial<ReceiptTemplate>,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.brandingService.updateTemplate(id, organizationId, data);
  }

  @Delete('templates/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a receipt template' })
  async deleteTemplate(
    @Param('id') id: string,
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.brandingService.deleteTemplate(id, organizationId);
  }

  // Receipt Preview
  @Post('templates/preview')
  @ApiOperation({ summary: 'Preview a receipt with sample data' })
  async previewReceipt(
    @Body() body: { templateId?: string; order: any },
    @ActiveUser('organizationId') organizationId: string,
    @Res() res: Response,
  ) {
    const html = await this.brandingService.renderReceipt(
      organizationId,
      body.order,
      body.templateId,
    );
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
