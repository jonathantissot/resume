## Local Development — personal-page

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js     | 18+     | Dockerfile pins Node 18; Node 22 also works |
| npm         | bundled with Node | no separate install needed |
| Docker      | any recent | optional — only needed for the containerised preview path |

No backend services, databases, or environment variables are required. The app is
a fully static React/Vite site.

---

### 1. Clone and install dependencies

```bash
git clone <your-fork-or-origin-url>
cd resume/apps/personal-page
npm install
```

---

### 2. Environment variables

**None required.** The Google Analytics measurement ID is hardcoded in
`src/services/analytics.js`. If you want to point at your own GA4 property
during development, edit that file directly — there is no `.env` involved.

---

### 3. Start the dev server

```bash
npm run dev
```

Vite starts the hot-reloading dev server. Expected output:

```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open http://localhost:5173 in your browser. Changes to `src/` are reflected
instantly without a full reload.

---

### 4. Verify everything is working

| Check | Expected result |
|-------|----------------|
| http://localhost:5173 | CV site loads, navigation and all sections visible |
| Browser console | No errors (GA4 may log a warning if network is blocked — safe to ignore) |
| Hot reload | Edit any `src/data/*.json` file and save — the page updates without a full refresh |

---

### 5. Build for production (optional)

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

Confirm the `dist/` directory is created with an `index.html` and hashed
asset files. `npm run preview` lets you verify the production bundle locally
before deploying.

---

### 6. Containerised preview (optional)

If you want to run the exact Docker image used in production:

```bash
# Build the image
docker build -t personal-page-local .

# Run it
docker run --rm -p 3000:3000 personal-page-local
```

Open http://localhost:3000 — the `serve` static server inside the container
responds with the production build.

---

### 7. Linting

```bash
npm run lint        # check for issues
npm run lint:fix    # auto-fix what ESLint can
```

---

### Common troubleshooting

**Port 5173 already in use**

```bash
npm run dev -- --port 5174
```

**`node_modules` out of date after a `git pull`**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Blank page / assets 404 in production build**

Check that `vite.config.js` does not set a `base` path that differs from where
you are serving the files. The default (`base: '/'`) is correct for S3/CloudFront
and `serve`.

**Google Analytics not firing in local dev**

Expected — GA4 is intentionally not blocked, but browsers may silently drop
requests to `google-analytics.com` if an ad-blocker is active. The site works
fully without it.

**`npm run build` fails with out-of-memory**

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```
