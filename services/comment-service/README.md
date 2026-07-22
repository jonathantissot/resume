# comment-service

Comments and threaded replies for blog posts, with EventBridge event publishing.

## Port
3003

## Responsibilities
- Create top-level comments and nested replies (depth tracked)
- Soft-delete comments (status: deleted)
- Publish CommentCreated events to AWS EventBridge for notification fan-out

## Environment Variables
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Shared secret with auth-service |
| `AWS_REGION` | AWS region for EventBridge |
| `EVENT_BUS_NAME` | EventBridge bus name (default: 'default') |
| `PORT` | HTTP port (default: 3003) |

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/comments` | Bearer | Create comment or reply |
| GET | `/comments/post/:postId` | — | List comments for a post |
| DELETE | `/comments/:id` | Bearer | Soft-delete a comment |

## Downstream Dependencies
- AWS RDS Aurora PostgreSQL (`comments` table)
- AWS EventBridge (publishes CommentCreated events)
- notification-service (subscribes to EventBridge events)
