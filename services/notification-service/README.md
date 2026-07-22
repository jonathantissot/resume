# notification-service

SNS + SES notification consumer — sends emails for comment and like events.

## Port
3005

## Responsibilities
- Poll SQS queue every 10 seconds for blog notification events
- Send email via AWS SES for CommentCreated events
- Accept SNS HTTP webhook subscriptions (for direct delivery mode)
- Extensible dispatch table for new event types

## Environment Variables
| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region for SNS/SES/SQS |
| `SQS_QUEUE_URL` | SQS queue URL receiving SNS fan-out messages |
| `SES_FROM_EMAIL` | Verified SES sender email address |
| `PORT` | HTTP port (default: 3005) |

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/notifications/webhook` | — | SNS HTTP subscription endpoint |

## Downstream Dependencies
- AWS SQS (inbound: events from comment-service and like-service via EventBridge/SNS)
- AWS SES (outbound: email notifications to users)
- No database dependency — stateless consumer
