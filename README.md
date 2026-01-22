# SaaS-POS: Enterprise Multi-Tenant Point of Sale System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)
![Node](https://img.shields.io/badge/node-20.x-green.svg)

A production-ready, enterprise-grade multi-tenant Point of Sale (POS) system built with modern technologies and best practices.

## 🚀 Features

### Core POS Features
- **Product Management**: Full CRUD operations with categories, SKUs, barcodes, and images
- **Order Processing**: Real-time order creation, modification, and completion
- **Payment Integration**: Stripe Terminal for card payments, cash handling
- **Receipt Printing**: Customizable thermal receipt templates
- **Offline Support**: RxDB-powered offline-first architecture with sync

### Multi-Tenancy
- **Organization Isolation**: Complete data separation per tenant
- **Role-Based Access Control**: Admin, Manager, Staff roles with granular permissions
- **Feature Flags**: Enable/disable features per organization
- **Custom Branding**: Per-organization themes, logos, and styling

### Enterprise Features
- **Tax Calculation**: Multi-region tax rules and automatic calculation
- **Discount System**: Percentage, fixed, buy-x-get-y, bundle discounts with coupons
- **Inventory Management**: Stock tracking, low stock alerts, reorder points
- **Analytics Dashboard**: Sales reports, top items, hourly trends
- **Webhooks**: Real-time event notifications for integrations
- **Queue System**: Background jobs for emails, reports, inventory alerts

## 🛠 Tech Stack

### Backend (API)
- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Queue**: Bull with Redis
- **Email**: Nodemailer

### Frontend (Web)
- **Framework**: React 19.x with TypeScript
- **Styling**: TailwindCSS 4.x
- **State Management**: TanStack Query + RxDB
- **Routing**: React Router 7.x
- **Desktop**: Electron support

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with HPA
- **CI/CD**: GitHub Actions
- **Monitoring**: Health checks, logging middleware

## 📦 Project Structure

```
saas-pos/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── branding/       # Customization & themes
│   │   │   ├── common/         # Shared utilities
│   │   │   ├── config/         # Configuration
│   │   │   ├── database/       # Migrations & seeds
│   │   │   ├── discounts/      # Coupon system
│   │   │   ├── health/         # Health checks
│   │   │   ├── orders/         # Order management
│   │   │   ├── organizations/  # Multi-tenancy
│   │   │   ├── payments/       # Stripe integration
│   │   │   ├── products/       # Product catalog
│   │   │   ├── queue/          # Background jobs
│   │   │   ├── sync/           # Offline sync
│   │   │   ├── tax/            # Tax calculation
│   │   │   ├── users/          # User management
│   │   │   └── webhooks/       # Event webhooks
│   │   └── test/
│   ├── web/                    # React Frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── pages/          # Page components
│   │   │   ├── services/       # API services
│   │   │   └── db/             # RxDB setup
│   │   └── electron/           # Desktop app
│   └── desktop/                # Electron main process
├── k8s/                        # Kubernetes manifests
├── .github/workflows/          # CI/CD pipelines
└── docker-compose.yml          # Local development
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- PostgreSQL 16.x
- Redis 7.x (optional, for queues)
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/BytesByBrave/SaaS-POS.git
cd SaaS-POS
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your configuration
```

4. **Start PostgreSQL** (if not using Docker)
```bash
# Create database
createdb saas_pos
```

5. **Run migrations and seed**
```bash
cd apps/api
npm run migration:run
npm run seed
```

6. **Start development servers**
```bash
# From root directory
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:5173
- API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

### Docker Development

```bash
# Start all services
docker-compose up -d

# Or with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | `saas_pos` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - |
| `JWT_EXPIRES_IN` | Token expiration | `1h` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `STRIPE_SECRET_KEY` | Stripe API key | - |
| `CORS_ORIGINS` | Allowed origins | `localhost:5173` |

## 📝 API Documentation

### Authentication
```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Products
```bash
# Create product (requires auth)
POST /api/v1/products
Authorization: Bearer <token>

{
  "name": "Espresso",
  "price": 2.50,
  "category": "Coffee",
  "stock": 100
}
```

### Orders
```bash
# Create order
POST /api/v1/orders
Authorization: Bearer <token>

{
  "total": 25.99,
  "items": [
    { "productName": "Espresso", "quantity": 2, "price": 2.50 }
  ]
}
```

Full API documentation available at `/api/docs` when running the server.

## 🧪 Testing

```bash
# Unit tests
npm run test --workspace=api

# E2E tests
npm run test:e2e --workspace=api

# Coverage report
npm run test:cov --workspace=api

# Frontend tests
npm run test --workspace=web
```

## 🚢 Deployment

### Docker Production Build
```bash
# Build images
docker-compose build

# Push to registry
docker-compose push
```

### Kubernetes Deployment
```bash
# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -l app=saas-pos-api
```

## 🔒 Security Features

- ✅ Helmet.js security headers
- ✅ Rate limiting (100 req/min)
- ✅ Input validation with class-validator
- ✅ SQL injection protection (TypeORM)
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Multi-tenant data isolation
- ✅ HTTPS enforcement in production
- ✅ Password hashing with bcrypt
- ✅ Request ID tracking for audit logs

## 🎨 Customization for Clients

### Branding
- Custom logo and favicon
- Color scheme configuration
- Custom fonts
- Custom CSS injection
- Receipt template customization

### Features
- Feature flags per organization
- Tax rules configuration
- Discount and coupon setup
- Webhook integrations
- Custom receipt templates

## 📊 Monitoring

### Health Endpoints
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/ready` - Readiness probe (includes DB check)
- `GET /api/v1/health/live` - Liveness probe

### Logs
All requests are logged with:
- Request ID
- User ID
- Organization ID
- Duration
- Status code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support inquiries, please contact:
- Email: support@saas-pos.com
- GitHub Issues: [Create Issue](https://github.com/BytesByBrave/SaaS-POS/issues)
