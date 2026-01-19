import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (apiKey) {
            this.stripe = new Stripe(apiKey, {
                apiVersion: '2025-01-27' as any,
            });
        }
    }

    async createConnectionToken() {
        if (!this.stripe) return { error: 'Stripe not configured' };

        // Stripe Terminal connection tokens are short-lived
        const token = await this.stripe.terminal.connectionTokens.create();
        return { secret: token.secret };
    }

    async createPaymentIntent(amount: number, currency: string = 'usd', organizationId: string) {
        if (!this.stripe) return { error: 'Stripe not configured' };

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // amount in cents
            currency,
            payment_method_types: ['card_present'],
            capture_method: 'manual',
            metadata: { organizationId },
        });

        return {
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id
        };
    }

    async capturePayment(paymentIntentId: string) {
        if (!this.stripe) return { error: 'Stripe not configured' };
        return this.stripe.paymentIntents.capture(paymentIntentId);
    }
}
