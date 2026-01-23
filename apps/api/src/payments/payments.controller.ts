import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUser } from '../common/decorators/active-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('connection-token')
  async createConnectionToken() {
    return this.paymentsService.createConnectionToken();
  }

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency?: string },
    @ActiveUser('organizationId') organizationId: string,
  ) {
    return this.paymentsService.createPaymentIntent(
      body.amount,
      body.currency || 'usd',
      organizationId,
    );
  }

  @Post('capture')
  async capturePayment(@Body() body: { paymentIntentId: string }) {
    return this.paymentsService.capturePayment(body.paymentIntentId);
  }
}
