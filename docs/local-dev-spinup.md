# Local Development: Blog Frontend + Backend

This guide covers two paths:

- **Mock mode** — run the blog-frontend alone with no backend. Zero setup, great for UI work.
- **Full stack** — run the blog-frontend against the real NestJS services backed by PostgreSQL.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 20 LTS | Next.js 16 + React 19 require Node >=18.18. Node 20 is recommended. |
| npm | 9+ | Ships with Node 20. |
| Docker | 24+ | Only needed for PostgreSQL (full-stack path). |
| Git | any | — |

Check your versions:

```
node -v
npm -v
docker -v
```

No `.nvmrc` exists yet. If you use nvm, `nvm install 20 && nvm use 20` is the safe choice.

---

## 1. Clone and install dependencies

```
git clone https://github.com/jonathantissot/resume.git
cd resume
```

Install each app/service independently — there is no root-level `npm install`.

**Blog frontend:**

```
cd apps/blog-frontend
npm install
```

**Backend services (only needed for full-stack path):**

```
cd services/post-service && npm install && cd ../..
cd services/like-service  && npm install && cd ../..
```

The `notification-service` connects to AWS SES/SQS and is not needed for local development.

---

## 2. Environment variable setup

### 2a. Blog frontend

The frontend reads one optional variable:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | (empty) | Base URL of the post-service API, e.g. `http://localhost:3002`. When absent the app runs entirely on built-in mock data. |

Create `apps/blog-frontend/.env.local`:

```
# Leave this unset (or comment it out) to use mock data.
# Set it to point at a running post-service for live data.
# NEXT_PUBLIC_API_URL=http://localhost:3002
```

`.env.local` is git-ignored by Next.js by default. Do not commit real values.

### 2b. post-service

Create `services/post-service/.env`:

```
# PostgreSQL connection string
DATABASE_URL=postgres://blog:password@localhost:5432/blog

# JWT secret — must match the value used by any auth service issuing tokens
JWT_SECRET=changeme-use-a-real-secret-locally

# Leave unset for local dev (enables TypeORM synchronize mode)
# NODE_ENV=production

PORT=3002
```

### 2c. like-service

Create `services/like-service/.env`:

```
DATABASE_URL=postgres://blog:password@localhost:5432/blog

# Must match post-service JWT_SECRET so tokens are accepted cross-service
JWT_SECRET=changeme-use-a-real-secret-locally

PORT=3004
```

> Both services share the same Postgres database and JWT secret in local dev.
> TypeORM `synchronize: true` (active when NODE_ENV is not `production`) creates
> tables automatically on first start — no migration step is needed locally.

---

## 3. Start the backend (full-stack path only)

### 3a. Start PostgreSQL via Docker

There is no `docker-compose.yml` in the repo yet. Run a standalone PostgreSQL container:

```
docker run -d \
  --name blog-postgres \
  -e POSTGRES_USER=blog \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blog \
  -p 5432:5432 \
  postgres:16-alpine
```

Verify it is healthy:

```
docker ps --filter name=blog-postgres
```

You should see `STATUS` as `Up`. If you need a psql shell:

```
docker exec -it blog-postgres psql -U blog -d blog
```

### 3b. Start post-service

```
cd services/post-service
npm run start:dev
```

Expected output:

```
post-service running on port 3002
```

TypeORM will log table creation on the first run. Subsequent starts skip this.

### 3c. Start like-service

Open a second terminal:

```
cd services/like-service
npm run start:dev
```

Expected output:

```
like-service running on port 3004
```

---

## 4. Start the blog-frontend dev server

```
cd apps/blog-frontend
npm run dev
```

Next.js starts on **http://localhost:3000** by default.

Expected output:

```
  ▲ Next.js 16.x.x
  - Local: http://localhost:3000
```

---

## 5. Verify everything is working

### Mock mode (no backend)

Open http://localhost:3000 — the home page lists posts from mock data. No backend required.

### Full-stack mode

Set `NEXT_PUBLIC_API_URL=http://localhost:3002` in `apps/blog-frontend/.env.local`, then restart the dev server.

Health-check each service from the terminal:

```
# post-service — returns a list of posts (empty array on a fresh DB)
curl -s http://localhost:3002/posts | head -c 200

# like-service — returns like count for a post id
curl -s http://localhost:3002/likes/post/test-id/count

# blog-frontend — page HTML
curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>'
```

Expected responses:

| Command | Expected |
|---------|----------|
| `curl /posts` | `[]` (empty array) or a JSON array of post objects |
| `curl /likes/post/test-id/count` | `{"count":0}` or similar JSON |
| `curl http://localhost:3000` | `<title>` tag containing the site name |

---

## 6. Services at a glance

| Service | Port | Mock fallback | Needs Postgres | Needs AWS |
|---------|------|---------------|---------------|-----------|
| blog-frontend | 3000 | Yes — full mock data if `NEXT_PUBLIC_API_URL` is unset | No | No |
| post-service | 3002 | — | Yes | No |
| like-service | 3004 | — | Yes | No |
| notification-service | 3005 | — | No | Yes (SES/SQS) |
| comment-service | — | Yes (frontend falls back to mock) | Not yet built | — |

---

## 7. Common troubleshooting

**`Error: connect ECONNREFUSED 127.0.0.1:5432`**
PostgreSQL is not running. Run the `docker run` command in step 3a, or check `docker ps` to see if the container stopped.

**`[TypeORM] Error: password authentication failed for user "blog"`**
The `POSTGRES_PASSWORD` in your Docker run command and `DATABASE_URL` do not match. Stop the container (`docker rm -f blog-postgres`), re-run with matching credentials, and restart the service.

**Port 3000 already in use**
Next.js will try the next free port and print it. Check the terminal output for the actual URL.

**Port 3002 or 3004 already in use**
Set `PORT=3003` (or any free port) in the service's `.env` file, then update `NEXT_PUBLIC_API_URL` in the frontend's `.env.local` to match.

**Frontend shows mock data even though `NEXT_PUBLIC_API_URL` is set**
`NEXT_PUBLIC_` variables are baked in at build time for client components. After editing `.env.local`, stop and restart `npm run dev` to pick up the change.

**`nest: command not found` when running `npm run start:dev`**
The NestJS CLI is a dev dependency. Run `npm install` inside the service directory first, then retry.

**TypeORM schema errors after a model change**
`synchronize: true` handles simple additions automatically. If you drop a column or rename a table you may need to wipe the local database: `docker rm -f blog-postgres` and re-run step 3a.
