# jonathantissot/resume — monorepo

This repo contains two independent products and their shared infrastructure.

| Product | Status | Live URL |
|---------|--------|----------|
| **personal-page** | Production | [jonathantissot.com](https://jonathantissot.com) |
| **blog platform** | Work in progress | — |

---

## Repository layout

```
resume/
├── apps/
│   ├── personal-page/          # CV / resume site — React 18 + Vite 5 (LIVE)
│   └── blog-frontend/          # Blog platform frontend — Next.js (WIP)
│
├── services/                   # Blog platform backend — NestJS microservices
│   ├── auth-service/
│   ├── post-service/
│   ├── comment-service/        # scaffolded; not yet implemented
│   ├── like-service/
│   ├── notification-service/   # requires AWS SES/SQS; not runnable locally
│   └── image-service/
│
├── k8s/                        # Kubernetes manifests (Kustomize)
│   ├── kustomization.yaml
│   ├── personal-page/
│   ├── post-service/
│   ├── like-service/
│   ├── auth-service/
│   ├── comment-service/
│   ├── image-service/
│   └── notification-service/
│
├── infra/                      # Terragrunt stacks (environment-specific)
│   ├── terragrunt.hcl          # Root config — provider + remote state
│   ├── _envcommon/             # Shared variable files
│   ├── aws-shared/             # Shared AWS resources (IAM, ECR, Route53)
│   ├── database/               # RDS / DocumentDB
│   ├── eks-cluster/            # EKS control plane + node groups
│   ├── api-services/           # API service deployments
│   ├── data-services/          # Data pipeline services
│   └── monitoring/             # Observability stack
│
├── terraform-modules/          # Reusable Terraform modules
│   ├── networking/             # VPC, subnets, security groups
│   ├── database/               # RDS / DocumentDB
│   ├── eks/                    # EKS cluster
│   ├── api-gateway/            # API Gateway + Lambda
│   ├── s3-lambda/              # S3 + Lambda event-driven
│   └── monitoring/             # CloudWatch / Prometheus
│
├── .github/workflows/
│   └── build-docker.yml        # CI/CD — builds personal-page Docker image
└── Makefile                    # Top-level build + deploy shortcuts
```

---

## Personal page

`apps/personal-page/` is the **production CV site** at jonathantissot.com.

- React 18 + Vite 5 + Tailwind CSS
- All content in `src/data/*.json` — no backend, no database
- Deploys via GitHub Actions → Docker → AWS S3 + CloudFront

### Personal page — local development

**Prerequisites:** Node.js 18+ and npm (bundled with Node). No environment variables needed.

```bash
cd apps/personal-page
npm install
npm run dev
```

Open http://localhost:5173. Hot reload is active — edit any `src/data/*.json` and the page updates instantly.

**Available scripts:**

```bash
npm run dev        # dev server on :5173
npm run build      # production build → dist/
npm run preview    # serve dist/ on :4173
npm run lint       # ESLint check
npm run lint:fix   # auto-fix ESLint issues
```

**Optional — containerised preview:**

```bash
# Build and run the same image used in production
docker build -t personal-page-local .
docker run --rm -p 3000:3000 personal-page-local
# Open http://localhost:3000
```

**Troubleshooting:**

| Problem | Fix |
|---------|-----|
| Port 5173 in use | `npm run dev -- --port 5174` |
| Stale modules after `git pull` | `rm -rf node_modules package-lock.json && npm install` |
| Out-of-memory during build | `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| GA4 not firing locally | Expected — browsers with ad-blockers silently drop the request. Safe to ignore. |

---

## Blog platform

`apps/blog-frontend/` + `services/` make up the blog platform MVP (work in progress).

**Stack overview:**
- Frontend: Next.js (`apps/blog-frontend/`) — port 3000
- post-service: NestJS + TypeORM + PostgreSQL — port 3002
- like-service: NestJS + TypeORM + PostgreSQL — port 3004
- notification-service: NestJS + AWS SES/SQS — port 3005 (not runnable locally)
- comment-service: scaffolded, not yet implemented (frontend falls back to mock data)
- auth-service / image-service: scaffolded

### Blog platform — local development

Two paths are available:

**Mock mode** — run the frontend only. Zero setup, great for UI work. The frontend falls back to built-in mock data when no backend URL is configured.

**Full-stack mode** — run the frontend against real NestJS services backed by PostgreSQL.

#### Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 20 LTS | Required for Next.js + React 19. Node 18.18 is the minimum. |
| npm | 9+ | Ships with Node 20. |
| Docker | 24+ | Only needed for PostgreSQL (full-stack path). |

```bash
node -v && npm -v && docker -v
```

No `.nvmrc` exists yet. If you use nvm: `nvm install 20 && nvm use 20`.

#### Step 1 — Install dependencies

There is no root-level `npm install`. Install each app/service independently.

```bash
# Blog frontend (required for both paths)
cd apps/blog-frontend
npm install

# Backend services (full-stack path only)
cd ../../services/post-service && npm install
cd ../like-service && npm install
```

#### Step 2 — Environment variables

**Blog frontend** (`apps/blog-frontend/.env.local`):

```bash
# Leave NEXT_PUBLIC_API_URL unset (or commented) to use mock data.
# Set it to point at a running post-service for live data.
# NEXT_PUBLIC_API_URL=http://localhost:3002
```

This file is git-ignored by Next.js. Do not commit real values.

**post-service** (`services/post-service/.env`, full-stack only):

```bash
DATABASE_URL=postgres://blog:password@localhost:5432/blog
JWT_SECRET=changeme-use-a-real-secret-locally
PORT=3002
```

**like-service** (`services/like-service/.env`, full-stack only):

```bash
DATABASE_URL=postgres://blog:password@localhost:5432/blog
JWT_SECRET=changeme-use-a-real-secret-locally
PORT=3004
```

Both services share the same Postgres database and JWT secret in local dev. TypeORM `synchronize: true` creates tables automatically on first start — no migration step needed.

#### Step 3 — Start PostgreSQL (full-stack path only)

There is no `docker-compose.yml` in the repo yet. Run a standalone container:

```bash
docker run -d \
  --name blog-postgres \
  -e POSTGRES_USER=blog \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blog \
  -p 5432:5432 \
  postgres:16-alpine
```

Verify it is running:

```bash
docker ps --filter name=blog-postgres
# STATUS should show "Up"
```

#### Step 4 — Start backend services (full-stack path only)

Open one terminal per service:

```bash
# Terminal 1
cd services/post-service
npm run start:dev
# Expected: "post-service running on port 3002"

# Terminal 2
cd services/like-service
npm run start:dev
# Expected: "like-service running on port 3004"
```

TypeORM logs table creation on the first run. Subsequent starts skip this.

#### Step 5 — Start the frontend

```bash
cd apps/blog-frontend
npm run dev
# Expected: Next.js starts on http://localhost:3000
```

#### Step 6 — Verify

**Mock mode (no backend):**

Open http://localhost:3000 — the home page lists posts from built-in mock data.

**Full-stack mode:**

Set `NEXT_PUBLIC_API_URL=http://localhost:3002` in `apps/blog-frontend/.env.local`, then restart `npm run dev`.

```bash
# post-service health
curl -s http://localhost:3002/posts | head -c 200

# like-service health
curl -s http://localhost:3004/likes/post/test-id/count

# frontend
curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>'
```

#### Services at a glance

| Service | Port | Mock fallback | Needs Postgres | Needs AWS |
|---------|------|---------------|----------------|-----------|
| blog-frontend | 3000 | Yes — full mock data when `NEXT_PUBLIC_API_URL` is unset | No | No |
| post-service | 3002 | — | Yes | No |
| like-service | 3004 | — | Yes | No |
| notification-service | 3005 | — | No | Yes (SES/SQS) |
| comment-service | — | Yes (frontend falls back to mock) | Not yet built | — |

#### Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL is not running — re-run the `docker run` in Step 3. |
| `password authentication failed for user "blog"` | `POSTGRES_PASSWORD` in Docker and `DATABASE_URL` don't match. `docker rm -f blog-postgres`, re-run with matching creds, restart service. |
| Port 3000 in use | Next.js auto-picks the next free port and prints it. |
| Port 3002 or 3004 in use | Set `PORT=3003` in the service's `.env`, update `NEXT_PUBLIC_API_URL` to match. |
| Frontend shows mock data despite `NEXT_PUBLIC_API_URL` being set | `NEXT_PUBLIC_` vars are baked in at build time. Stop and restart `npm run dev`. |
| `nest: command not found` | Run `npm install` inside the service directory first. |
| TypeORM schema errors after a model change | `docker rm -f blog-postgres`, re-run Step 3 to wipe and recreate the database. |

---

## Deployment

### Personal page

```bash
npm run build                                                          # in apps/personal-page/
aws s3 sync dist/ s3://kopius-jt --delete
aws cloudfront create-invalidation --distribution-id E1631T979B1SEX --paths "/*"
```

Or use the Makefile shortcut from the repo root:

```bash
make deploy
```

CI/CD via `.github/workflows/build-docker.yml` — triggers on push to `main` or `develop`, builds the Docker image, and pushes to GHCR.

### Blog platform

Work in progress. Kubernetes manifests are in `k8s/`. Apply via Kustomize:

```bash
kubectl apply -k k8s/
```

---

## Infrastructure

`infra/` and `terraform-modules/` hold cloud infrastructure managed with Terraform and Terragrunt. See `infra/README.md` for full details.

```bash
# Init and apply a specific stack (example: EKS)
cd infra/eks-cluster
terragrunt init
terragrunt plan
terragrunt apply
```

---

## Content management (personal page)

All personal page content lives in `apps/personal-page/src/data/`:

| File | Contents |
|------|----------|
| `profile.json` | Name, title, social links |
| `skills.json` | Technical and soft skills |
| `education.json` | Academic history |
| `certifications.json` | Certifications |
| `experiences.json` | Job history |
| `achievements.json` | Career achievements |
| `recommendations.json` | Professional recommendations |
| `socialLinks.json` | Social media profiles |

Edit the JSON directly — the Vite dev server hot-reloads on save.

---

## Further reading

- [React documentation](https://react.dev)
- [Vite guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Next.js documentation](https://nextjs.org/docs)
- [NestJS documentation](https://docs.nestjs.com)
- [Kubernetes docs](https://kubernetes.io/docs)
- [Terragrunt docs](https://terragrunt.gruntwork.io/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
