# auth-service

JWT + Cognito authentication service for the blog platform.

## Port
3001

## Responsibilities
- User signup / login (local credentials via bcrypt)
- AWS Cognito integration (cognito_sub column on User entity)
- JWT token issuance and validation
- JwtAuthGuard for use by other services

## Environment Variables
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Aurora RDS) |
| `JWT_SECRET` | Secret for signing JWTs |
| `AWS_REGION` | AWS region for Cognito |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Cognito App Client ID |
| `PORT` | HTTP port (default: 3001) |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login, receive JWT |
| GET | `/auth/me` | Get current user profile (requires Bearer token) |

## Downstream Dependencies
- AWS RDS Aurora PostgreSQL (`users` table)
- AWS Cognito User Pool (optional, for federated login)
