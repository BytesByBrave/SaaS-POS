import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationBranding } from './entities/organization-branding.entity';
import { ReceiptTemplate } from './entities/receipt-template.entity';

@Injectable()
export class BrandingService {
  private readonly logger = new Logger(BrandingService.name);

  constructor(
    @InjectRepository(OrganizationBranding)
    private readonly brandingRepository: Repository<OrganizationBranding>,
    @InjectRepository(ReceiptTemplate)
    private readonly templateRepository: Repository<ReceiptTemplate>,
  ) { }

  // Branding Operations
  async getBranding(organizationId: string): Promise<OrganizationBranding> {
    let branding = await this.brandingRepository.findOne({
      where: { organizationId },
    });

    if (!branding) {
      // Create default branding
      branding = await this.createDefaultBranding(organizationId);
    }

    return branding;
  }

  async updateBranding(
    organizationId: string,
    data: Partial<OrganizationBranding>,
  ): Promise<OrganizationBranding> {
    let branding = await this.brandingRepository.findOne({
      where: { organizationId },
    });

    if (!branding) {
      branding = await this.createDefaultBranding(organizationId);
    }

    await this.brandingRepository.update({ id: branding.id }, data);
    return this.getBranding(organizationId);
  }

  private async createDefaultBranding(organizationId: string): Promise<OrganizationBranding> {
    const branding = this.brandingRepository.create({
      organizationId,
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      accentColor: '#1F2937',
      backgroundColor: '#F3F4F6',
      textColor: '#111827',
      fontFamily: 'Inter',
      defaultTheme: 'light',
      settings: {
        showLogo: true,
        showAddress: true,
        showPhone: true,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'hh:mm A',
        currencyPosition: 'before',
      },
    });
    return this.brandingRepository.save(branding);
  }

  // Generate CSS Variables
  generateCssVariables(branding: OrganizationBranding): string {
    return `
:root {
  --color-primary: ${branding.primaryColor};
  --color-secondary: ${branding.secondaryColor};
  --color-accent: ${branding.accentColor};
  --color-background: ${branding.backgroundColor};
  --color-text: ${branding.textColor};
  --color-error: ${branding.errorColor};
  --color-success: ${branding.successColor};
  --font-family: '${branding.fontFamily}', system-ui, sans-serif;
}
${branding.customCss || ''}
    `.trim();
  }

  // Receipt Template Operations
  async getTemplates(organizationId: string): Promise<ReceiptTemplate[]> {
    return this.templateRepository.find({
      where: { organizationId },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async getDefaultTemplate(organizationId: string, type: string = 'thermal'): Promise<ReceiptTemplate> {
    let template = await this.templateRepository.findOne({
      where: { organizationId, type: type as any, isDefault: true, isActive: true },
    });

    if (!template) {
      template = await this.createDefaultTemplate(organizationId, type);
    }

    return template;
  }

  async getTemplate(id: string, organizationId: string): Promise<ReceiptTemplate | null> {
    return this.templateRepository.findOne({
      where: { id, organizationId },
    });
  }

  async createTemplate(organizationId: string, data: Partial<ReceiptTemplate>): Promise<ReceiptTemplate> {
    if (data.isDefault) {
      await this.templateRepository.update(
        { organizationId, type: data.type, isDefault: true },
        { isDefault: false },
      );
    }

    const template = this.templateRepository.create({
      ...data,
      organizationId,
    });
    return this.templateRepository.save(template);
  }

  async updateTemplate(
    id: string,
    organizationId: string,
    data: Partial<ReceiptTemplate>,
  ): Promise<ReceiptTemplate | null> {
    if (data.isDefault) {
      const existing = await this.getTemplate(id, organizationId);
      if (existing) {
        await this.templateRepository.update(
          { organizationId, type: existing.type, isDefault: true },
          { isDefault: false },
        );
      }
    }

    await this.templateRepository.update({ id, organizationId }, data);
    return this.getTemplate(id, organizationId);
  }

  async deleteTemplate(id: string, organizationId: string): Promise<void> {
    await this.templateRepository.delete({ id, organizationId });
  }

  private async createDefaultTemplate(organizationId: string, type: string = 'thermal'): Promise<ReceiptTemplate> {
    const template = this.templateRepository.create({
      organizationId,
      name: 'Default Template',
      type: type as any,
      isDefault: true,
      isActive: true,
      paperWidth: type === 'thermal' ? 80 : 210,
      headerTemplate: `
<div class="receipt-header">
  {{#if options.showLogo}}
    <img src="{{branding.logoUrl}}" alt="{{branding.businessName}}" class="logo" />
  {{/if}}
  <h1 class="business-name">{{branding.businessName}}</h1>
  {{#if options.showAddress}}
    <p class="address">{{branding.address}}</p>
  {{/if}}
  {{#if options.showPhone}}
    <p class="phone">Tel: {{branding.phone}}</p>
  {{/if}}
</div>
      `.trim(),
      bodyTemplate: `
<div class="receipt-body">
  <div class="order-info">
    <p><strong>Order #:</strong> {{order.orderNumber}}</p>
    <p><strong>Date:</strong> {{formatDate order.createdAt}}</p>
    {{#if options.showCashier}}
      <p><strong>Cashier:</strong> {{order.cashierName}}</p>
    {{/if}}
  </div>
  
  <hr class="divider" />
  
  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      {{#each order.items}}
        <tr>
          <td>{{this.productName}}</td>
          <td>{{this.quantity}}</td>
          <td>{{formatCurrency this.totalPrice}}</td>
        </tr>
        {{#if this.notes}}
          <tr class="item-note">
            <td colspan="3">↳ {{this.notes}}</td>
          </tr>
        {{/if}}
      {{/each}}
    </tbody>
  </table>
  
  <hr class="divider" />
  
  <div class="totals">
    {{#if options.showSubtotal}}
      <p class="subtotal"><span>Subtotal:</span> <span>{{formatCurrency order.subtotal}}</span></p>
    {{/if}}
    {{#if order.discountAmount}}
      <p class="discount"><span>Discount:</span> <span>-{{formatCurrency order.discountAmount}}</span></p>
    {{/if}}
    {{#if options.showTax}}
      <p class="tax"><span>Tax:</span> <span>{{formatCurrency order.taxAmount}}</span></p>
    {{/if}}
    <p class="total"><strong>Total:</strong> <strong>{{formatCurrency order.total}}</strong></p>
  </div>
  
  {{#if options.showPaymentMethod}}
    <p class="payment-method"><strong>Payment:</strong> {{order.paymentMethod}}</p>
  {{/if}}
</div>
      `.trim(),
      footerTemplate: `
<div class="receipt-footer">
  <hr class="divider" />
  {{#if branding.receiptFooter}}
    <p class="custom-footer">{{branding.receiptFooter}}</p>
  {{else}}
    <p>Thank you for your purchase!</p>
    <p>Please come again.</p>
  {{/if}}
  {{#if options.showBarcode}}
    <div class="barcode">
      <img src="{{generateBarcode order.id}}" alt="{{order.id}}" />
    </div>
  {{/if}}
</div>
      `.trim(),
      customCss: `
.receipt-header { text-align: center; margin-bottom: 10px; }
.logo { max-width: 60px; margin-bottom: 5px; }
.business-name { font-size: 1.2em; margin: 5px 0; }
.divider { border: none; border-top: 1px dashed #000; margin: 10px 0; }
.items-table { width: 100%; font-size: 0.9em; }
.items-table th { text-align: left; border-bottom: 1px solid #000; }
.item-note { font-size: 0.8em; color: #666; }
.totals { margin-top: 10px; }
.totals p { display: flex; justify-content: space-between; margin: 3px 0; }
.total { font-size: 1.1em; margin-top: 5px !important; }
.receipt-footer { text-align: center; margin-top: 15px; font-size: 0.85em; }
.barcode { margin-top: 10px; }
      `.trim(),
      options: {
        showLogo: true,
        showBusinessName: true,
        showAddress: true,
        showPhone: true,
        showOrderNumber: true,
        showDate: true,
        showTime: true,
        showCashier: true,
        showTax: true,
        showSubtotal: true,
        showDiscount: true,
        showPaymentMethod: true,
        showBarcode: false,
      },
    });

    return this.templateRepository.save(template);
  }

  // Render receipt
  async renderReceipt(
    organizationId: string,
    order: any,
    templateId?: string,
  ): Promise<string> {
    const branding = await this.getBranding(organizationId);

    let template: ReceiptTemplate | null;
    if (templateId) {
      template = await this.getTemplate(templateId, organizationId);
      if (!template) {
        throw new NotFoundException('Template not found');
      }
    } else {
      template = await this.getDefaultTemplate(organizationId);
    }

    if (!template) {
      throw new NotFoundException('No template available');
    }

    // Simple template rendering (in production, use Handlebars or similar)
    const context = { order, branding, options: template.options };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Arial', sans-serif; 
      width: ${template.paperWidth}mm;
      padding: ${template.marginTop}mm ${template.marginRight}mm ${template.marginBottom}mm ${template.marginLeft}mm;
    }
    ${template.customCss || ''}
  </style>
</head>
<body>
  ${this.simpleTemplateRender(template.headerTemplate, context)}
  ${this.simpleTemplateRender(template.bodyTemplate, context)}
  ${this.simpleTemplateRender(template.footerTemplate, context)}
</body>
</html>
    `.trim();

    return html;
  }

  private simpleTemplateRender(template: string, context: any): string {
    // Very basic template rendering - in production use Handlebars
    let result = template;

    // Replace simple placeholders
    result = result.replace(/\{\{branding\.(\w+)\}\}/g, (_, key) =>
      context.branding?.[key] || ''
    );
    result = result.replace(/\{\{order\.(\w+)\}\}/g, (_, key) =>
      context.order?.[key] || ''
    );

    return result;
  }
}
