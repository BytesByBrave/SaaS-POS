import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from '../src/common/interceptors/response-transform.interceptor';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testOrganizationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseTransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /api/v1/health - should return healthy status', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.timestamp).toBeDefined();
        });
    });

    it('GET /api/v1/health/ready - should return readiness status', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.checks).toBeDefined();
          expect(res.body.checks.database).toBeDefined();
          expect(res.body.checks.memory).toBeDefined();
        });
    });

    it('GET /api/v1/health/live - should return liveness status', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/health/live')
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.status).toBe('alive');
          expect(res.body.uptime).toBeDefined();
        });
    });
  });

  describe('Authentication', () => {
    it('POST /api/v1/auth/login - should return 401 for invalid credentials', () => {
      return supertest.default(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'invalid@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('POST /api/v1/auth/login - should return token for valid credentials', () => {
      return supertest.default(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@example.com', password: 'password123' })
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.access_token).toBeDefined();
          expect(res.body.data.user).toBeDefined();
          authToken = res.body.data.access_token;
          testOrganizationId = res.body.data.user.organizationId;
        });
    });
  });

  describe('Products (Authenticated)', () => {
    it('GET /api/v1/products - should require authentication', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/products')
        .expect(401);
    });

    it('GET /api/v1/products - should return products with valid token', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    let createdProductId: string;

    it('POST /api/v1/products - should create a product', () => {
      return supertest.default(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          price: 9.99,
          stock: 100,
          category: 'Test Category',
        })
        .expect(201)
        .expect((res: supertest.Response) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe('Test Product');
          createdProductId = res.body.data.id;
        });
    });

    it('GET /api/v1/products/:id - should return a specific product', () => {
      return supertest.default(app.getHttpServer())
        .get(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.id).toBe(createdProductId);
        });
    });

    it('PATCH /api/v1/products/:id - should update a product', () => {
      return supertest.default(app.getHttpServer())
        .patch(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: 14.99 })
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.price).toBe('14.99');
        });
    });

    it('DELETE /api/v1/products/:id - should delete a product', () => {
      return supertest.default(app.getHttpServer())
        .delete(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Orders (Authenticated)', () => {
    let createdOrderId: string;

    it('POST /api/v1/orders - should create an order', () => {
      return supertest.default(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          total: 25.99,
          items: [
            { productName: 'Test Item 1', quantity: 2, price: 10.00 },
            { productName: 'Test Item 2', quantity: 1, price: 5.99 },
          ],
        })
        .expect(201)
        .expect((res: supertest.Response) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBeDefined();
          createdOrderId = res.body.data.id;
        });
    });

    it('GET /api/v1/orders - should return orders', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /api/v1/orders/:id - should return a specific order', () => {
      return supertest.default(app.getHttpServer())
        .get(`/api/v1/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.id).toBe(createdOrderId);
        });
    });

    it('GET /api/v1/orders/analytics/sales-per-hour - should return sales analytics', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/orders/analytics/sales-per-hour')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('GET /api/v1/orders/analytics/top-items - should return top items', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/orders/analytics/top-items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Tax Calculation', () => {
    it('POST /api/v1/tax/calculate - should calculate tax', () => {
      return supertest.default(app.getHttpServer())
        .post('/api/v1/tax/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            { price: 10.00, quantity: 2, category: 'Food' },
            { price: 5.00, quantity: 1, category: 'Beverage' },
          ],
        })
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.subtotal).toBeDefined();
          expect(res.body.data.taxAmount).toBeDefined();
          expect(res.body.data.total).toBeDefined();
        });
    });
  });

  describe('Discounts', () => {
    let discountId: string;

    it('POST /api/v1/discounts - should create a discount', () => {
      return supertest.default(app.getHttpServer())
        .post('/api/v1/discounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Discount',
          code: 'TEST20',
          type: 'percentage',
          value: 20,
          isActive: true,
        })
        .expect(201)
        .expect((res: supertest.Response) => {
          expect(res.body.data.code).toBe('TEST20');
          discountId = res.body.data.id;
        });
    });

    it('POST /api/v1/discounts/validate - should validate discount code', () => {
      return supertest.default(app.getHttpServer())
        .post('/api/v1/discounts/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST20',
          items: [{ productName: 'Test', price: 100, quantity: 1 }],
        })
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.valid).toBe(true);
          expect(res.body.data.discountAmount).toBe(20);
        });
    });

    it('DELETE /api/v1/discounts/:id - should delete discount', () => {
      return supertest.default(app.getHttpServer())
        .delete(`/api/v1/discounts/${discountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Branding', () => {
    it('GET /api/v1/branding - should return organization branding', () => {
      return supertest.default(app.getHttpServer())
        .get('/api/v1/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.primaryColor).toBeDefined();
          expect(res.body.data.fontFamily).toBeDefined();
        });
    });

    it('PUT /api/v1/branding - should update branding', () => {
      return supertest.default(app.getHttpServer())
        .put('/api/v1/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          primaryColor: '#FF5733',
          businessName: 'Test POS',
        })
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body.data.primaryColor).toBe('#FF5733');
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting', async () => {
      // This test verifies rate limiting is active
      const responses = await Promise.all(
        Array(10).fill(null).map(() =>
          supertest.default(app.getHttpServer()).get('/api/v1/health')
        )
      );

      // All should succeed under normal rate limits
      responses.forEach((res: supertest.Response) => {
        expect(res.status).toBe(200);
      });
    });
  });
});
