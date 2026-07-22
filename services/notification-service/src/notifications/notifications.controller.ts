import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

// Internal webhook endpoint — receives SNS HTTP subscriptions directly
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('webhook')
  async handleSnsWebhook(@Body() body: any) {
    // SNS delivers to this endpoint when subscription type is HTTP
    if (body.Type === 'SubscriptionConfirmation') {
      // Auto-confirm in dev; in prod verify SNS certificate
      return { message: 'SubscribeURL should be confirmed manually in production' };
    }
    if (body.Type === 'Notification') {
      const event = JSON.parse(body.Message);
      // Fire and forget; errors are logged internally
      this.notificationsService.sendEmail(
        'placeholder@example.com',
        event.subject ?? 'Blog Notification',
        event.message ?? JSON.stringify(event),
      ).catch(() => null);
    }
    return { received: true };
  }
}
