# API Reference

## Base URL
```
Production: https://api.pos.yourdomain.com/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All API endpoints (except health checks and login) require authentication.

### Headers
```
Authorization: Bearer <access_token>
X-Tenant-ID: <organization_id>  (optional, for cross-org operations)
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "organizationId": "org-uuid",
      "features": {
        "retail": true,
        "restaurant": true
      }
    }
  }
}
```

---

## Products

### List Products
```http
GET /products
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| category | string | Filter by category |
| search | string | Search in name/description |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Espresso",
      "price": "2.50",
      "category": "Coffee",
      "stock": 100,
      "image": "https://...",
      "createdAt": "2024-01-23T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Get Product
```http
GET /products/:id
Authorization: Bearer <token>
```

### Create Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cappuccino",
  "price": 3.50,
  "category": "Coffee",
  "stock": 50,
  "sku": "CAP-001",
  "barcode": "1234567890123",
  "description": "Creamy coffee drink"
}
```

**Required Role:** admin, manager

### Update Product
```http
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 4.00,
  "stock": 75
}
```

**Required Role:** admin, manager

### Delete Product
```http
DELETE /products/:id
Authorization: Bearer <token>
```

**Required Role:** admin, manager

### Low Stock Products
```http
GET /products/low-stock
Authorization: Bearer <token>
X-Threshold: 10
```

---

## Orders

### List Orders
```http
GET /orders
Authorization: Bearer <token>
```

### Get Order
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "total": 25.99,
  "items": [
    {
      "productId": "product-uuid",
      "productName": "Espresso",
      "quantity": 2,
      "price": 2.50,
      "notes": "Extra hot"
    }
  ],
  "paymentMethod": "card",
  "customerId": "customer-uuid",
  "notes": "Takeaway order"
}
```

### Sales Analytics
```http
GET /orders/analytics/sales-per-hour
Authorization: Bearer <token>
```

**Required Role:** admin, manager

### Top Items
```http
GET /orders/analytics/top-items
Authorization: Bearer <token>
```

**Required Role:** admin, manager

---

## Tax

### Calculate Tax
```http
POST /tax/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "category": "Food",
      "price": 10.00,
      "quantity": 2
    }
  ],
  "region": {
    "country": "US",
    "state": "CA",
    "city": "Los Angeles"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subtotal": 20.00,
    "taxAmount": 1.90,
    "total": 21.90,
    "breakdown": [
      {
        "taxName": "CA Sales Tax",
        "taxRate": 9.5,
        "taxAmount": 1.90,
        "applicableTo": "Food"
      }
    ]
  }
}
```

### Manage Tax Rates
```http
GET /tax/rates
POST /tax/rates
PUT /tax/rates/:id
DELETE /tax/rates/:id
```

**Required Role:** admin, manager

---

## Discounts

### Validate Discount Code
```http
POST /discounts/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SUMMER20",
  "items": [
    {
      "productName": "Espresso",
      "price": 10.00,
      "quantity": 2,
      "category": "Coffee"
    }
  ],
  "customerId": "customer-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": {
      "id": "uuid",
      "code": "SUMMER20",
      "type": "percentage",
      "value": 20
    },
    "discountAmount": 4.00,
    "appliedTo": ["Espresso"]
  }
}
```

### Manage Discounts
```http
GET /discounts
POST /discounts
PUT /discounts/:id
DELETE /discounts/:id
```

**Required Role:** admin, manager

---

## Branding

### Get Branding
```http
GET /branding
Authorization: Bearer <token>
```

### Update Branding
```http
PUT /branding
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "My Coffee Shop",
  "primaryColor": "#4F46E5",
  "logoUrl": "https://...",
  "address": "123 Main St",
  "phone": "+1-555-0123"
}
```

**Required Role:** admin, manager

### Receipt Templates
```http
GET /branding/templates
POST /branding/templates
PUT /branding/templates/:id
DELETE /branding/templates/:id
POST /branding/templates/preview
```

---

## Webhooks

### Available Events
```http
GET /webhooks/events
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    { "event": "order.created", "description": "When a new order is created" },
    { "event": "order.completed", "description": "When an order is completed" },
    { "event": "product.low_stock", "description": "When product reaches low stock" }
  ]
}
```

### Create Webhook
```http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Order Notifications",
  "url": "https://your-server.com/webhook",
  "events": ["order.created", "order.completed"],
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

**Required Role:** admin

### Test Webhook
```http
POST /webhooks/:id/test
Authorization: Bearer <token>
```

### Webhook Logs
```http
GET /webhooks/:id/logs
Authorization: Bearer <token>
```

---

## Health Checks

### Basic Health
```http
GET /health
```
No authentication required.

### Readiness
```http
GET /health/ready
```
Includes database connectivity check.

### Liveness
```http
GET /health/live
```
Returns uptime information.

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-23T00:00:00Z",
  "path": "/api/v1/products",
  "requestId": "uuid"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Rate Limiting

- Default: 100 requests per minute
- Auth endpoints: 10 requests per minute

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706000000
```
