import { Post } from "@/types/post";
import { Comment } from "@/types/comment";

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    slug: "building-hub-and-spoke-microservices",
    title: "Building Hub-and-Spoke Microservices with NestJS",
    excerpt:
      "How I approached decomposing a legacy MuleSoft monolith into a clean NestJS hub-and-spoke architecture — lessons on canonical models, saga patterns, and cross-channel contracts.",
    content: `
# Building Hub-and-Spoke Microservices with NestJS

When tasked with refactoring a large MuleSoft 3-layer integration platform into
a modern microservices architecture, the first challenge was agreeing on a
canonical data model that all channels could speak.

## The Problem

Multiple consumer channels — point-of-sale, loan pricing, document assembly,
and order management — each had their own representation of a "loan". This led
to brittle, channel-specific transformations scattered across the codebase.

## The Solution: Canonical Model

We defined a single, channel-agnostic loan model owned by a core-service. Each
channel then derived its own projection from this canonical form.

\`\`\`typescript
interface LoanCanonical {
  loanId: string;
  lifecycleStage: LifecycleStage;
  borrower: BorrowerProfile;
  property: PropertyProfile;
  offers: OfferSet;
  channelContext: ChannelContext;
}
\`\`\`

## Hub-and-Spoke Topology

The hub acts as the message broker and canonical model owner. Spokes (channels)
subscribe to domain events and maintain their own read models.

This pattern eliminated the cross-channel coupling that made the old system
fragile and gave each team autonomy over their own service.

## Lessons Learned

- Start with the canonical model before writing any service code.
- Saga patterns work well for multi-step loan workflows across services.
- Event sourcing gives you an audit trail that compliance teams love.
    `.trim(),
    author: "Jonathan Tissot",
    date: "2024-11-15T10:00:00Z",
    reactionCount: 42,
    tags: ["architecture", "nestjs", "microservices"],
  },
  {
    id: "2",
    slug: "typescript-strict-mode-worth-it",
    title: "TypeScript Strict Mode: Is It Worth the Pain?",
    excerpt:
      "After enabling strict mode on a 50k-line TypeScript codebase mid-project, here's what broke, what we learned, and why I'd do it again.",
    content: `
# TypeScript Strict Mode: Is It Worth the Pain?

Short answer: yes. Longer answer: it depends on *when* you turn it on.

## What Strict Mode Enables

\`strict: true\` in tsconfig is actually a bundle of seven compiler flags:
\`strictNullChecks\`, \`noImplicitAny\`, \`strictFunctionTypes\`, and more.

## The Pain Points

On a mid-sized codebase, enabling strict mode surfaced around 800 type errors.
Most fell into a few categories:

1. **Implicit any** — function parameters that were never typed
2. **Nullable dereferences** — accessing properties without null checks
3. **Callback signature mismatches** — especially in array methods

## The Payoffs

After the painful migration week, we caught three production bugs purely from
the type system — no tests involved. That alone justified the investment.

## Recommendation

Enable strict mode at project start. If you're mid-project, do it in a
dedicated PR, fix errors category by category, and don't mix in feature work.
    `.trim(),
    author: "Jonathan Tissot",
    date: "2024-09-03T08:30:00Z",
    reactionCount: 27,
    tags: ["typescript", "best-practices"],
  },
  {
    id: "3",
    slug: "tailwind-design-systems-at-scale",
    title: "Tailwind at Scale: Building a Shared Design System",
    excerpt:
      "Utility-first CSS sounds chaotic until you layer a proper design token system on top. Here's the architecture that let three teams share components without stepping on each other.",
    content: `
# Tailwind at Scale: Building a Shared Design System

Tailwind CSS is opinionated about utilities, but it says nothing about
how teams should share components. Here's what worked for us.

## The Problem with Raw Utilities

When three teams each build their own buttons, you end up with fifteen
slightly-different button variants and no consistency. The solution is not
abandoning Tailwind — it's adding a component layer on top.

## Token System First

We extended tailwind.config.ts with a semantic token layer:

\`\`\`js
theme: {
  extend: {
    colors: {
      surface: { DEFAULT: '#ffffff', muted: '#f8f9fa' },
      brand:   { DEFAULT: '#0066cc', hover: '#0052a3' },
    }
  }
}
\`\`\`

## Shared Component Library

Components lived in a private npm package. Each component accepted only
semantic class names, not raw Tailwind utilities, so the design token
system was enforced at the component boundary.

## Result

New features built with shared components were consistent by default.
The design system became a productivity multiplier, not a bureaucratic
overhead.
    `.trim(),
    author: "Jonathan Tissot",
    date: "2024-07-20T14:15:00Z",
    reactionCount: 61,
    tags: ["tailwind", "design-systems", "frontend"],
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    postId: "1",
    author: "Alex Kim",
    body: "Great writeup. We ran into exactly the same cross-channel pain before adopting a canonical model. The saga pattern point is gold — event sourcing made our auditors very happy.",
    date: "2024-11-16T09:14:00Z",
  },
  {
    id: "c2",
    postId: "1",
    author: "Priya Sharma",
    body: "Did you find that teams started treating the canonical model as a dumping ground over time? We had to add governance rules to prevent it ballooning.",
    date: "2024-11-18T14:32:00Z",
  },
  {
    id: "c3",
    postId: "2",
    author: "Marcus Webb",
    body: "800 type errors sounds terrifying but honestly manageable if you batch by category. noImplicitAny was our biggest one too.",
    date: "2024-09-05T11:20:00Z",
  },
];

/** Emoji reaction seeds per post (postId → emoji → count). */
export const MOCK_REACTIONS: Record<string, Record<string, number>> = {
  "1": { "👍": 18, "❤️": 14, "🔥": 10 },
  "2": { "👍": 12, "❤️": 9, "🔥": 6 },
  "3": { "👍": 25, "❤️": 20, "🔥": 16 },
};
