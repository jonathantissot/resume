# AGENTS.md — Working agreement for this repo

This repository is a **monorepo** with two independent products plus shared infra.
Read this fully before changing anything — it defines both the layout and the
**Definition of Done** every task must meet.

## Repository layout

- `apps/personal-page/` — Jonathan's personal CV / resume site (**LIVE**:
  jonathantissot.com). React 18 + Vite 5. This is production; do not break it.
- `apps/blog-frontend/` — the blog platform MVP frontend (Next.js). Work in
  progress.
- `services/` — the blog platform backend: 6 NestJS microservices
  (auth, post, comment, like, notification, image) + `docker-compose.yml` for
  local orchestration.
- `infra/`, `terraform-modules/`, `k8s/` — infrastructure as code (Terragrunt /
  Terraform / Kubernetes manifests).

> NOTE: some of the paths above are the TARGET layout. If you find the personal
> page still living at the repo root (`src/`, `index.html`, `vite.config.js`,
> root `package.json` named `jonathan-cv`), the restructure task has not run yet
> — follow the task you were given, don't assume the move is done.

## The personal page is LIVE — protect it

- The personal page currently deploys via `.github/workflows/build-docker.yml`
  (builds at repo root) and `Makefile` (`npm run build` → `aws s3 sync dist/`
  → CloudFront invalidation). **If you move or restructure the personal page,
  you MUST update those paths in the same change and prove the build still
  produces `dist/`.** A restructure that breaks the deploy is not done.
- Never delete or rewrite the personal page's content/components. Moving files
  is fine; changing what the site renders is out of scope unless the task says
  so.

## Definition of Done (every task must satisfy this)

A change is NOT done until ALL of the following hold and you have stated in your
completion summary exactly what you ran and what the output was:

1. **It builds.** Run the relevant build and confirm exit 0:
   - personal page: `npm run build` in its directory → produces `dist/`.
   - blog frontend: its `npm run build`.
   - a NestJS service: `npm run build` in that service directory.
2. **It lints** where a linter exists (`npm run lint`).
3. **It runs locally — actually runs, not just "config looks right."** For
   backend/service work this means bringing the stack up with
   `docker compose up` (from `services/`) and confirming containers reach a
   healthy/running state. A file/config audit is NOT sufficient evidence that
   something works.
4. **It is smoke-tested end-to-end** for the behaviour you touched: hit the real
   endpoint / load the real page and confirm the expected response, not just
   that the process started. Prefer a scripted check (curl health endpoints,
   a request through the flow) over eyeballing.
5. **You reported the evidence.** The completion summary must name the exact
   commands run and their observed result (build exit code, container status,
   HTTP status / response body of the smoke test). "Should work" is not
   evidence.

## QA gate

The `qa` role runs an independent pass on top of self-verification. If QA finds
gaps it will **block** the task with an enumerated gap list — that is the signal
for the dispatcher to open one fix task per gap, not a reason to stop. Do not
mark a parent goal complete while its QA gate is red.

## Conventions

- Match existing style; no drive-by refactors, renames, or reformatting outside
  the task's scope.
- Add any imports/deps your code needs; check the nearest `package.json` for
  what's already available before adding a dependency.
- Line endings: the personal page files use CRLF — preserve them; don't reflow
  whole files.
