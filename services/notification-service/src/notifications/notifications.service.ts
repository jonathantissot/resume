import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SQSClient, ReceiveMessageCommand, DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface NotificationEvent {
  event: string;
  postId?: string;
  userId?: string;
  authorId?: string;
  commentId?: string;
  reaction?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly sqs = new SQSClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
  private readonly ses = new SESClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
  private readonly queueUrl = process.env.SQS_QUEUE_URL ?? '';
  private readonly fromEmail = process.env.SES_FROM_EMAIL ?? 'noreply@example.com';

  onModuleInit() {
    this.logger.log('notification-service started, polling SQS queue');
  }

  // Poll SQS every 10 seconds for new notification events
  @Cron(CronExpression.EVERY_10_SECONDS)
  async pollQueue() {
    if (!this.queueUrl) return;
    try {
      const result = await this.sqs.send(new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 5,
      }));
      for (const msg of result.Messages ?? []) {
        await this.processMessage(msg);
      }
    } catch (err) {
      this.logger.error('SQS poll error', err);
    }
  }

  private async processMessage(msg: any) {
    try {
      const body = JSON.parse(msg.Body);
      const detail: NotificationEvent = body.detail ?? body;
      await this.dispatch(detail);
      await this.sqs.send(new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: msg.ReceiptHandle,
      }));
    } catch (err) {
      this.logger.error('Failed to process message', err);
    }
  }

  private async dispatch(event: NotificationEvent) {
    switch (event.event) {
      case 'CommentCreated':
        await this.sendEmail(
          'author-placeholder@example.com', // TODO: look up author email by authorId
          'New comment on your post',
          `Someone commented on your post (postId: ${event.postId}).`,
        );
        break;
      case 'PostLiked':
        // Optional — author can opt in to like notifications
        this.logger.log(`PostLiked event received for post ${event.postId}`);
        break;
      default:
        this.logger.warn(`Unknown event type: ${event.event}`);
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.ses.send(new SendEmailCommand({
        Source: this.fromEmail,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject },
          Body: { Text: { Data: body } },
        },
      }));
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error('SES send failed', err);
    }
  }
}
