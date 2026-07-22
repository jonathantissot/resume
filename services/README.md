# Blog Platform — Backend Services

This directory contains all backend microservices for the personal blog platform MVP.
Architecture reference: `/home/jt/blog-platform-mvp-architecture.md`

---

## Service Map

| Service | Port | Type | Responsibility | Downstream Dependencies |
|---------|------|------|----------------|------------------------|
| auth-service | 3001 | NestJS / EKS | JWT + Cognito auth; user signup, login, session | Aurora PostgreSQL (users), AWS Cognito |
| post-service | 3002 | NestJS / EKS | Blog post CRUD; draft → publish → archive lifecycle | Aurora PostgreSQL (posts), auth-service (JWT secret) |
| comment-service | 3003 | NestJS / EKS | Threaded comments and replies; EventBridge event publishing | Aurora PostgreSQL (comments), AWS EventBridge, notification-service |
| like-service | 3004 | NestJS / EKS | Post likes/reactions (idempotent toggle); SNS event publishing | Aurora PostgreSQL (likes), AWS SNS, notification-service |
| notification-service | 3005 | NestJS / EKS | SQS consumer + SES email sender; SNS webhook receiver | AWS SQS, AWS SES (no DB) |
| image-service | — | AWS Lambda | S3-triggered thumbnail generation (sharp); writes back to S3 | AWS S3, sharp |

---

## Directory Structure

```
services/
├── README.md                    ← this file
├── auth-service/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── auth/
│   │       ├── auth.module.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── entities/user.entity.ts
│   │       ├── dto/{signup,login}.dto.ts
│   │       ├── guards/jwt.guard.ts
│   │       └── strategies/jwt.strategy.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── post-service/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── posts/
│   │       ├── posts.module.ts
│   │       ├── posts.controller.ts
│   │       ├── posts.service.ts
│   │       ├── entities/post.entity.ts
│   │       ├── dto/{create,update}-post.dto.ts
│   │       ├── guards/jwt.guard.ts
│   │       └── strategies/jwt.strategy.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── comment-service/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── comments/
│   │       ├── comments.module.ts
│   │       ├── comments.controller.ts
│   │       ├── comments.service.ts
│   │       ├── entities/comment.entity.ts
│   │       ├── dto/create-comment.dto.ts
│   │       ├── guards/jwt.guard.ts
│   │       └── strategies/jwt.strategy.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── like-service/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── likes/
│   │       ├── likes.module.ts
│   │       ├── likes.controller.ts
│   │       ├── likes.service.ts
│   │       ├── entities/like.entity.ts
│   │       ├── dto/toggle-like.dto.ts
│   │       ├── guards/jwt.guard.ts
│   │       └── strategies/jwt.strategy.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── notification-service/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── notifications/
│   │       ├── notifications.module.ts
│   │       ├── notifications.controller.ts
│   │       └── notifications.service.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── image-service/              ← AWS Lambda (not NestJS)
    ├── src/handler.ts
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

---

## Database Schema (Aurora PostgreSQL)

### users (auth-service)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| email | VARCHAR | unique |
| password_hash | VARCHAR | nullable (null = Cognito-only user) |
| cognito_sub | VARCHAR | nullable |
| role | VARCHAR | 'admin' / 'author' / 'user' |
| display_name | VARCHAR | nullable |
| avatar_url | VARCHAR | nullable |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### posts (post-service)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| author_id | UUID | FK → users.id |
| title | VARCHAR | |
| slug | VARCHAR | unique |
| content | TEXT | Markdown |
| excerpt | VARCHAR(500) | nullable |
| cover_image_url | VARCHAR(500) | nullable |
| thumbnail_url | VARCHAR(500) | set by image-service Lambda |
| status | VARCHAR | draft / published / archived |
| visibility | VARCHAR | private / friends / public |
| category | VARCHAR(50) | nullable |
| tags | TEXT[] | |
| metadata | JSONB | SEO data, social cards |
| created_at | TIMESTAMPTZ | |
| published_at | TIMESTAMPTZ | nullable |
| updated_at | TIMESTAMPTZ | |

### comments (comment-service)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| post_id | UUID | FK → posts.id |
| author_id | UUID | FK → users.id |
| parent_id | UUID | nullable; set for replies |
| depth | INT | 0 = top-level, 1 = reply |
| content | TEXT | |
| status | VARCHAR | active / flagged / deleted |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### likes (like-service)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| post_id | UUID | FK → posts.id |
| user_id | UUID | FK → users.id |
| reaction | VARCHAR | 'like' / 'love' / 'wow' |
| created_at | TIMESTAMPTZ | |
| (unique constraint) | | (post_id, user_id) — idempotent |

---

## Event Flow

```
comment-service ──── EventBridge ──── SNS ──── SQS ──── notification-service ──── SES ──── email
like-service ──────────────────────── SNS ──── SQS ──┘
image-service ◀── S3 ObjectCreated event (uploads/* prefix)
             └──▶ S3 PutObject (thumbnails/<size>/<filename>.jpg)
```

---

## Running Locally

Each NestJS service is independent. Example for auth-service:

```bash
cd services/auth-service
npm install
DATABASE_URL=postgres://user:pass@localhost:5432/blog \
  JWT_SECRET=devsecret \
  npm run start:dev
```

For Docker:
```bash
docker build -t auth-service .
docker run -p 3001:3001 \
  -e DATABASE_URL=postgres://... \
  -e JWT_SECRET=... \
  auth-service
```

## Shared JWT Secret

All NestJS services share the same `JWT_SECRET` environment variable. The
auth-service issues tokens; all other services validate them locally without
calling back to auth-service. This is intentional for MVP simplicity — tokens
are validated by re-verifying the signature against the shared secret.

For production, consider rotating to asymmetric keys (RS256) so the private key
only lives in auth-service.
