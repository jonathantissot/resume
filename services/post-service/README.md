# post-service

Blog post CRUD service — manages blog posts lifecycle (draft → published → archived).

## Port
3002

## Responsibilities
- Create / read / update / delete blog posts
- Manage post status: draft, published, archived
- Slug generation for SEO-friendly URLs
- Author ownership checks for mutations

## Environment Variables
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Shared secret with auth-service |
| `PORT` | HTTP port (default: 3002) |

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/posts` | Bearer | Create draft post |
| GET | `/posts` | — | List posts (filter by ?status=) |
| GET | `/posts/:slug` | — | Public post by slug |
| PUT | `/posts/:id` | Bearer | Update post |
| POST | `/posts/:id/publish` | Bearer | Publish post |
| POST | `/posts/:id/unpublish` | Bearer | Unpublish post |
| DELETE | `/posts/:id` | Bearer | Delete post |

## Downstream Dependencies
- AWS RDS Aurora PostgreSQL (`posts` table)
- auth-service (shared JWT secret for token validation)
