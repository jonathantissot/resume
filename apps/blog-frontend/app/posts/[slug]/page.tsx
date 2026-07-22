import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPosts, getReactions, getComments } from "@/lib/api";
import ReactionBar from "@/components/ReactionBar";
import CommentSection from "@/components/CommentSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Very simple markdown-to-HTML renderer for the mock content.
 * When the real API returns HTML, replace this with dangerouslySetInnerHTML
 * or a proper markdown lib like remark/rehype.
 */
function renderContent(markdown: string): string {
  return markdown
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre><code>${escaped}</code></pre>`;
    })
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[huploc])/gm, "")
    .replace(/^(<li>.+<\/li>\n?)+/gm, (m) => `<ul>${m}</ul>`)
    .replace(/(<p>)?(<h[1-3]>)/g, "$2")
    .replace(/(<\/h[1-3]>)(<\/p>)?/g, "$1");
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, reactions, comments] = await Promise.all([
    getPostBySlug(slug),
    // Reactions + comments are fetched using the post id, resolved after we
    // know the post. A real app would parallelize these differently, but here
    // we need the id first.
    null as null,
    null as null,
  ]);

  if (!post) notFound();

  const [reactionData, commentData] = await Promise.all([
    getReactions(post.id),
    getComments(post.id),
  ]);

  const html = renderContent(post.content);

  return (
    <article>
      <header className="mb-10">
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-amber-400 transition-colors mb-6 inline-flex items-center gap-1"
        >
          <span aria-hidden="true">&larr;</span> All posts
        </Link>
        <h1 className="font-lora text-3xl font-semibold text-white leading-snug mt-4 mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
          <span>{post.author}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Emoji reactions — client component with optimistic updates */}
      <ReactionBar postId={post.id} initial={reactionData} />

      {/* Comments list + add form — client component */}
      <CommentSection postId={post.id} initial={commentData} />
    </article>
  );
}
