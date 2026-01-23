import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { HealthModule } from './health/health.module';
import { TaxModule } from './tax/tax.module';
import { DiscountModule } from './discounts/discount.module';
import { BrandingModule } from './branding/branding.module';
import { WebhookModule } from './webhooks/webhook.module';
// import { QueueModule } from './queue/queue.module'; // Uncomment when Redis is available

// Entities
import { Organization } from './organizations/entities/organization.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { User } from './users/entities/user.entity';
import { TaxRate } from './tax/entities/tax-rate.entity';
import { Discount } from './discounts/entities/discount.entity';
import { DiscountUsage } from './discounts/entities/discount-usage.entity';
import { OrganizationBranding } from './branding/entities/organization-branding.entity';
import { ReceiptTemplate } from './branding/entities/receipt-template.entity';
import { Webhook } from './webhooks/entities/webhook.entity';
import { WebhookLog } from './webhooks/entities/webhook-log.entity';

// Configuration
import { configuration, configValidationSchema } from './config/configuration';

// Middleware
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      cache: true,
    }),

    // Database with connection pooling
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [
          Organization,
          Product,
          Order,
          OrderItem,
          User,
          TaxRate,
          Discount,
          DiscountUsage,
          OrganizationBranding,
          ReceiptTemplate,
          Webhook,
          WebhookLog,
        ],
        synchronize: configService.get<boolean>('database.synchronize', false),
        ssl: configService.get<boolean>('database.ssl')
          ? { rejectUnauthorized: false }
          : false,
        // Connection Pooling
        extra: {
          max: configService.get<number>('database.poolSize', 10),
          min: 2,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        },
        // Logging
        logging: configService.get('NODE_ENV') !== 'production',
        logger: 'advanced-console',
        // Retry Logic
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: 60000, // 1 minute
          limit: configService.get('NODE_ENV') === 'production' ? 100 : 1000,
        },
      ],
    }),

    // Core Modules
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProductsModule,
    OrdersModule,
    SyncModule,
    PaymentsModule,

    // Enterprise Modules
    TaxModule,
    DiscountModule,
    BrandingModule,
    WebhookModule,
    // QueueModule, // Uncomment when Redis is available
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, LoggingMiddleware).forRoutes('*');
  }
}
