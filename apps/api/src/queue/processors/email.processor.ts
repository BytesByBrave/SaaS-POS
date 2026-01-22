import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import { EmailJobData } from '../queue.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.mailtrap.io'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER', ''),
        pass: this.configService.get('SMTP_PASS', ''),
      },
    });
  }

  @Process('send')
  async handleSend(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id} to ${job.data.to}`);

    try {
      const html = this.renderTemplate(job.data.template, job.data.context);

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM', '"SaaS POS" <noreply@saas-pos.com>'),
        to: job.data.to,
        subject: job.data.subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${job.data.to}`);
      return { success: true, to: job.data.to };
    } catch (error) {
      this.logger.error(`Failed to send email to ${job.data.to}:`, error.message);
      throw error;
    }
  }

  private renderTemplate(template: string, context: Record<string, any>): string {
    const templates: Record<string, (ctx: any) => string> = {
      welcome: (ctx) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to SaaS POS!</h1>
          <p>Hi ${ctx.name},</p>
          <p>Thank you for joining SaaS POS. We're excited to have you on board!</p>
          <p>Your point-of-sale system is ready to use. Log in to start managing your business.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5173'}" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Get Started
          </a>
          <p style="margin-top: 20px; color: #666;">Best regards,<br>The SaaS POS Team</p>
        </div>
      `,
      'order-confirmation': (ctx) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Order Confirmation</h1>
          <p>Your order <strong>#${ctx.orderId}</strong> has been confirmed.</p>
          <p style="font-size: 24px; color: #059669;">Total: $${ctx.total.toFixed(2)}</p>
          <p>Thank you for your purchase!</p>
        </div>
      `,
      'password-reset': (ctx) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Password Reset</h1>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${ctx.resetToken}" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      'low-stock-alert': (ctx) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626;">⚠️ Low Stock Alert</h1>
          <p><strong>${ctx.productName}</strong> is running low on stock.</p>
          <p>Current stock: <strong style="color: #DC2626;">${ctx.currentStock}</strong></p>
          <p>Threshold: ${ctx.threshold}</p>
          <p>Please restock this item soon to avoid stockouts.</p>
        </div>
      `,
      'daily-report': (ctx) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">📊 Daily Sales Report</h1>
          <p>Here's your sales summary for ${ctx.date}:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #F3F4F6;">
              <td style="padding: 10px; border: 1px solid #E5E7EB;">Total Orders</td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>${ctx.totalOrders}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #E5E7EB;">Total Revenue</td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong style="color: #059669;">$${ctx.totalRevenue.toFixed(2)}</strong></td>
            </tr>
            <tr style="background: #F3F4F6;">
              <td style="padding: 10px; border: 1px solid #E5E7EB;">Average Order Value</td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>$${ctx.averageOrderValue.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
      `,
    };

    const templateFn = templates[template];
    if (!templateFn) {
      return `<p>${JSON.stringify(context)}</p>`;
    }
    return templateFn(context);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Email job ${job.id} failed: ${error.message}`);
  }
}
