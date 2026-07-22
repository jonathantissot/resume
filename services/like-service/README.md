# like-service

Post likes / reactions with idempotent toggle and SNS event publishing.

## Port
3004

## Responsibilities
- Toggle likes on posts (idempotent — same user + post = toggle)
- Support reaction types (like, love, wow — extensible)
- Publish PostLiked events to AWS SNS for notification fan-out
- Serve like counts and per-user like status

## Environment Variables
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Shared secret with auth-service |
| `AWS_REGION` | AWS region for SNS |
| `SNS_TOPIC_ARN` | SNS topic ARN for PostLiked events |
| `PORT` | HTTP port (default: 3004) |

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/likes/toggle` | Bearer | Toggle like on a post |
| GET | `/likes/post/:postId/count` | — | Get like count for post |
| GET | `/likes/post/:postId/me` | Bearer | Check if current user liked post |

## Downstream Dependencies
- AWS RDS Aurora PostgreSQL (`likes` table)
- AWS SNS (publishes PostLiked events)
- notification-service (subscribes to SNS events)
