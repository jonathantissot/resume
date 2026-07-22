# frontend

Next.js 16 blog frontend for jonathantissot.com.

Stack: Next.js 16 App Router · TypeScript · Tailwind CSS v4

---

## Routes

| Route              | Description                                      |
|--------------------|--------------------------------------------------|
| `/`                | Post listing — cards with title, excerpt, date, reaction count |
| `/posts/[slug]`    | Post detail — full content, author, date, tags  |

---

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

---

## Environment variables

| Variable                | Required | Description                                    |
|-------------------------|----------|------------------------------------------------|
| `NEXT_PUBLIC_API_URL`   | No       | Base URL of the blog API (e.g. `http://localhost:3001`). When unset the app uses built-in mock data — no backend required. |

---

## Project structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout: header nav + footer
│   ├── page.tsx            # / — Post listing page
│   ├── globals.css         # Tailwind v4 + prose styles
│   └── posts/
│       └── [slug]/
│           └── page.tsx    # /posts/[slug] — Post detail page
├── lib/
│   ├── api.ts              # Typed API client (falls back to mock data)
│   └── mock-data.ts        # Local placeholder posts
└── types/
    └── post.ts             # Post interface
```

---

## API contract

`lib/api.ts` expects the API to implement:

- `GET /posts` → `Post[]`
- `GET /posts/:slug` → `Post` (404 when not found)

See `types/post.ts` for the full `Post` shape.

---

## Scripts

| Command         | Description          |
|-----------------|----------------------|
| `npm run dev`   | Development server   |
| `npm run build` | Production build     |
| `npm start`     | Start production server |
