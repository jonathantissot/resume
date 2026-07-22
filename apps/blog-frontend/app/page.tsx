import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/api";
import { Post } from "@/types/post";

export const metadata: Metadata = {
  title: "Writing",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="group border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 hover:bg-neutral-900 transition-all duration-200">
      <Link href={`/posts/${post.slug}`} className="block">
        <header className="mb-3">
          <h2 className="font-lora text-xl font-semibold text-white group-hover:text-amber-400 transition-colors leading-snug mb-2">
            {post.title}
          </h2>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-label={`${post.reactionCount} reactions`}>
              <span aria-hidden="true">&#10084;&#65039;</span>{" "}
              {post.reactionCount}
            </span>
          </div>
        </header>
        <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        {post.tags && post.tags.length > 0 && (
          <footer className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </footer>
        )}
      </Link>
    </article>
  );
}

export default async function HomePage() {
  const posts = await getPosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <section className="mb-12">
        <h1 className="font-lora text-3xl font-semibold text-white mb-3">
          Writing
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
          Notes on distributed systems, TypeScript, and the craft of building
          software that holds up at scale.
        </p>
      </section>

      {sorted.length === 0 ? (
        <p className="text-neutral-500 text-sm">No posts yet. Check back soon.</p>
      ) : (
        <ul className="space-y-4" role="list">
          {sorted.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
