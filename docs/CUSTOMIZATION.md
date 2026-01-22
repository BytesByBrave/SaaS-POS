# Client Customization Guide

This guide explains how to customize the SaaS-POS system for different clients and industries.

## Table of Contents
1. [Branding Customization](#branding-customization)
2. [Feature Configuration](#feature-configuration)
3. [Tax Configuration](#tax-configuration)
4. [Discount & Promotions](#discount--promotions)
5. [Receipt Templates](#receipt-templates)
6. [Webhook Integrations](#webhook-integrations)
7. [Multi-Location Setup](#multi-location-setup)
8. [Industry-Specific Configurations](#industry-specific-configurations)

---

## Branding Customization

### Via API

```bash
PUT /api/v1/branding
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "businessName": "Coffee Paradise",
  "logoUrl": "https://cdn.example.com/logo.png",
  "faviconUrl": "https://cdn.example.com/favicon.ico",
  "tagline": "The best coffee in town",
  
  "primaryColor": "#8B4513",
  "secondaryColor": "#D4A574",
  "accentColor": "#2D1810",
  "backgroundColor": "#FFF8F0",
  "textColor": "#2D1810",
  
  "fontFamily": "Poppins",
  "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  
  "address": "123 Coffee Street, Brew City, BC 12345",
  "phone": "+1 (555) 123-4567",
  "email": "hello@coffeeparadise.com",
  "website": "https://coffeeparadise.com",
  
  "socialLinks": {
    "facebook": "https://facebook.com/coffeeparadise",
    "instagram": "https://instagram.com/coffeeparadise",
    "twitter": "https://twitter.com/coffeeparadise"
  },
  
  "receiptFooter": "Thank you for choosing Coffee Paradise!\nFollow us @coffeeparadise",
  
  "settings": {
    "showLogo": true,
    "showAddress": true,
    "showPhone": true,
    "showEmail": false,
    "showSocialLinks": true,
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "hh:mm A",
    "currencyPosition": "before"
  }
}
```

### Via Admin Dashboard
1. Navigate to Settings > Branding
2. Upload logo and favicon
3. Configure colors using the color picker
4. Set contact information
5. Preview changes before saving

### Custom CSS Injection

For advanced styling:

```json
{
  "customCss": ".pos-header { border-bottom: 3px solid var(--color-primary); } .product-card:hover { transform: scale(1.02); }"
}
```

---

## Feature Configuration

### Enable/Disable Features per Organization

```bash
PUT /api/v1/organizations/:id
Authorization: Bearer <admin_token>

{
  "features": {
    "retail": true,
    "restaurant": true,
    "service": false,
    "inventory": true,
    "tables": true,
    "appointments": false
  }
}
```

### Feature Descriptions

| Feature | Description | Use Case |
|---------|-------------|----------|
| `retail` | Standard product sales | Shops, convenience stores |
| `restaurant` | Table management, kitchen orders | Restaurants, cafes |
| `service` | Appointment booking | Salons, repair shops |
| `inventory` | Stock tracking | All businesses |
| `tables` | Table layout & status | Restaurants, bars |
| `appointments` | Service scheduling | Service businesses |

---

## Tax Configuration

### Create Tax Rates

```bash
POST /api/v1/tax/rates
Authorization: Bearer <admin_token>

{
  "name": "State Sales Tax",
  "rate": 8.25,
  "type": "percentage",
  "country": "US",
  "state": "TX",
  "isDefault": true,
  "applicableCategories": [],
  "isInclusive": false
}
```

### Multi-Region Taxes

Example: Different taxes for different product categories

```bash
# Food - Lower tax
POST /api/v1/tax/rates
{
  "name": "Food Tax",
  "rate": 0,
  "applicableCategories": ["Food", "Grocery"],
  "state": "CA"
}

# Standard tax
POST /api/v1/tax/rates
{
  "name": "CA Sales Tax",
  "rate": 9.5,
  "applicableCategories": [],
  "state": "CA",
  "isDefault": true
}
```

### Tax-Inclusive Pricing

For regions where prices include tax:

```json
{
  "name": "VAT",
  "rate": 20,
  "isInclusive": true
}
```

---

## Discount & Promotions

### Discount Types

#### Percentage Discount
```json
{
  "name": "Summer Sale",
  "code": "SUMMER20",
  "type": "percentage",
  "value": 20,
  "minimumOrderAmount": 50,
  "maximumDiscountAmount": 100
}
```

#### Fixed Amount Discount
```json
{
  "name": "$10 Off",
  "code": "SAVE10",
  "type": "fixed",
  "value": 10,
  "minimumOrderAmount": 30
}
```

#### Buy X Get Y Free
```json
{
  "name": "Buy 2 Get 1 Free",
  "code": "B2G1",
  "type": "buy_x_get_y",
  "conditions": {
    "buyQuantity": 2,
    "getQuantity": 1
  },
  "applicableCategories": ["Coffee"]
}
```

### Time-Based Discounts

Happy Hour discount:
```json
{
  "name": "Happy Hour",
  "code": "HAPPYHOUR",
  "type": "percentage",
  "value": 25,
  "isAutoApply": true,
  "conditions": {
    "dayOfWeek": [1, 2, 3, 4, 5],
    "timeRange": {
      "start": "16:00",
      "end": "18:00"
    }
  }
}
```

### Category-Specific Discounts
```json
{
  "name": "Beverage Special",
  "code": "DRINKS25",
  "type": "percentage",
  "value": 25,
  "applicableCategories": ["Coffee", "Tea", "Smoothies"],
  "excludedProductIds": ["premium-coffee-id"]
}
```

---

## Receipt Templates

### Create Custom Template

```bash
POST /api/v1/branding/templates
Authorization: Bearer <admin_token>

{
  "name": "Branded Receipt",
  "type": "thermal",
  "isDefault": true,
  "paperWidth": 80,
  "headerTemplate": "<div class='header'>{{branding.businessName}}</div>",
  "bodyTemplate": "<!-- order items -->",
  "footerTemplate": "<div>{{branding.receiptFooter}}</div>",
  "customCss": ".header { font-size: 20px; font-weight: bold; }",
  "options": {
    "showLogo": true,
    "showBusinessName": true,
    "showBarcode": true,
    "barcodeType": "qr"
  }
}
```

### Template Variables

| Variable | Description |
|----------|-------------|
| `{{branding.businessName}}` | Organization name |
| `{{branding.address}}` | Business address |
| `{{branding.phone}}` | Phone number |
| `{{branding.logoUrl}}` | Logo image URL |
| `{{order.id}}` | Order ID |
| `{{order.orderNumber}}` | Human-readable order number |
| `{{order.items}}` | Array of order items |
| `{{order.subtotal}}` | Pre-tax total |
| `{{order.taxAmount}}` | Tax amount |
| `{{order.discountAmount}}` | Discount applied |
| `{{order.total}}` | Final total |
| `{{order.paymentMethod}}` | Payment type used |
| `{{order.createdAt}}` | Order timestamp |

---

## Webhook Integrations

### Available Events

| Event | Trigger |
|-------|---------|
| `order.created` | New order placed |
| `order.completed` | Order marked complete |
| `order.cancelled` | Order cancelled |
| `product.created` | New product added |
| `product.updated` | Product modified |
| `product.low_stock` | Stock below threshold |
| `payment.success` | Payment processed |
| `payment.failed` | Payment declined |

### Setup Webhook

```bash
POST /api/v1/webhooks
Authorization: Bearer <admin_token>

{
  "name": "Accounting Integration",
  "url": "https://accounting-software.com/webhook",
  "events": ["order.completed", "payment.success"],
  "headers": {
    "X-API-Key": "your-api-key"
  }
}
```

### Webhook Payload Format

```json
{
  "event": "order.completed",
  "timestamp": "2024-01-23T00:00:00Z",
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-001",
    "total": 25.99,
    "items": [...]
  }
}
```

### Signature Verification

Webhooks include a signature header:
```
X-Webhook-Signature: sha256=abc123...
```

Verify in your application:
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = `sha256=${hmac.digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## Multi-Location Setup

### Create Additional Locations

Each location is a separate organization with shared branding:

```bash
POST /api/v1/organizations
Authorization: Bearer <super_admin_token>

{
  "name": "Coffee Paradise - Downtown",
  "slug": "coffee-paradise-downtown",
  "type": "restaurant",
  "parentOrganizationId": "main-org-id",
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD"
  }
}
```

### Location-Specific Settings
- Separate inventory per location
- Location-specific tax rates
- Different operating hours
- Unique receipt templates

---

## Industry-Specific Configurations

### Retail Store
```json
{
  "type": "retail",
  "features": {
    "retail": true,
    "inventory": true,
    "restaurant": false,
    "tables": false
  },
  "settings": {
    "enableBarcode": true,
    "enableLoyalty": true,
    "allowReturns": true
  }
}
```

### Restaurant
```json
{
  "type": "restaurant",
  "features": {
    "restaurant": true,
    "tables": true,
    "inventory": true
  },
  "settings": {
    "enableKitchenDisplay": true,
    "enableTableStatus": true,
    "enableSplitBill": true,
    "serviceFee": 18
  }
}
```

### Coffee Shop
```json
{
  "type": "restaurant",
  "features": {
    "restaurant": true,
    "retail": true,
    "inventory": true
  },
  "settings": {
    "quickOrderMode": true,
    "enableModifiers": true,
    "defaultOrderType": "takeaway"
  }
}
```

### Service Business (Salon/Spa)
```json
{
  "type": "service",
  "features": {
    "service": true,
    "appointments": true,
    "retail": true
  },
  "settings": {
    "enableBooking": true,
    "bookingWindow": 30,
    "cancellationPolicy": "24h"
  }
}
```

---

## Best Practices

1. **Test in Development**: Always test customizations in a development environment first
2. **Backup Before Changes**: Export current configuration before making major changes
3. **Document Custom Code**: If using custom CSS or templates, document changes
4. **Monitor Webhooks**: Regularly check webhook logs for delivery failures
5. **Review Tax Settings**: Verify tax calculations before going live
6. **Train Staff**: Ensure staff understands custom workflows
