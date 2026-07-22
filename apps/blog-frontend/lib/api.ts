import { Post } from "@/types/post";
import { Comment } from "@/types/comment";
import { MOCK_POSTS, MOCK_COMMENTS, MOCK_REACTIONS } from "@/lib/mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Posts ──────────────────────────────────────────────────────────────────

/**
 * Fetch all posts.
 * When NEXT_PUBLIC_API_URL is set, calls GET /posts from the real API.
 * Otherwise falls back to local mock data.
 */
export async function getPosts(): Promise<Post[]> {
  if (!API_BASE) {
    return Promise.resolve(MOCK_POSTS);
  }

  const res = await fetch(`${API_BASE}/posts`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<Post[]>;
}

/**
 * Fetch a single post by slug.
 * Falls back to mock data when no API URL is configured.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!API_BASE) {
    const post = MOCK_POSTS.find((p) => p.slug === slug) ?? null;
    return Promise.resolve(post);
  }

  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to fetch post: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<Post>;
}

/**
 * Create a new post — calls POST /posts.
 * In mock mode, returns a synthesised Post object without persisting.
 */
export async function createPost(data: {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
}): Promise<Post> {
  if (!API_BASE) {
    return Promise.resolve({
      id: Math.random().toString(36).slice(2),
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.body,
      author: "Jonathan Tissot",
      date: new Date().toISOString(),
      reactionCount: 0,
      tags: [],
    });
  }

  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create post: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<Post>;
}

// ── Reactions ──────────────────────────────────────────────────────────────

export type ReactionMap = Record<string, number>;

/**
 * Fetch reaction counts for a post — GET /likes/:postId.
 * Falls back to mock seed data.
 */
export async function getReactions(postId: string): Promise<ReactionMap> {
  if (!API_BASE) {
    return Promise.resolve(MOCK_REACTIONS[postId] ?? { "👍": 0, "❤️": 0, "🔥": 0 });
  }

  const res = await fetch(`${API_BASE}/likes/${encodeURIComponent(postId)}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch reactions: ${res.status}`);
  }

  return res.json() as Promise<ReactionMap>;
}

/**
 * Add (or toggle) a reaction — POST /likes/:postId.
 * In mock mode this is a no-op: the optimistic update in the component is
 * the source of truth for UI without a real API.
 */
export async function addReaction(
  postId: string,
  emoji: string
): Promise<void> {
  if (!API_BASE) {
    return Promise.resolve();
  }

  const res = await fetch(`${API_BASE}/likes/${encodeURIComponent(postId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emoji }),
  });

  if (!res.ok) {
    throw new Error(`Failed to add reaction: ${res.status}`);
  }
}

// ── Comments ───────────────────────────────────────────────────────────────

/**
 * Fetch comments for a post — GET /comments/:postId.
 * Falls back to mock data.
 */
export async function getComments(postId: string): Promise<Comment[]> {
  if (!API_BASE) {
    return Promise.resolve(
      MOCK_COMMENTS.filter((c) => c.postId === postId)
    );
  }

  const res = await fetch(
    `${API_BASE}/comments/${encodeURIComponent(postId)}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch comments: ${res.status}`);
  }

  return res.json() as Promise<Comment[]>;
}

/**
 * Post a new comment — POST /comments/:postId.
 * In mock mode, returns a synthesised Comment without persisting.
 */
export async function addComment(
  postId: string,
  data: { author: string; body: string }
): Promise<Comment> {
  if (!API_BASE) {
    return Promise.resolve({
      id: Math.random().toString(36).slice(2),
      postId,
      author: data.author,
      body: data.body,
      date: new Date().toISOString(),
    });
  }

  const res = await fetch(
    `${API_BASE}/comments/${encodeURIComponent(postId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to post comment: ${res.status}`);
  }

  return res.json() as Promise<Comment>;
}
