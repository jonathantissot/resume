"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import { addComment } from "@/lib/api";

interface Props {
  postId: string;
  initial: Comment[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CommentSection({ postId, initial }: Props) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const newComment = await addComment(postId, {
        author: author.trim(),
        body: body.trim(),
      });
      setComments((prev) => [...prev, newComment]);
      setAuthor("");
      setBody("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-12">
      <h2
        id="comments-heading"
        className="font-lora text-xl font-semibold text-white mb-6"
      >
        {comments.length === 0
          ? "No comments yet"
          : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
      </h2>

      {/* Comment list */}
      {comments.length > 0 && (
        <ol className="space-y-6 mb-10" aria-label="Comments">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-5 py-4"
            >
              <header className="flex items-baseline gap-3 mb-2">
                <span className="text-sm font-medium text-neutral-200">
                  {c.author}
                </span>
                <time
                  dateTime={c.date}
                  className="text-xs text-neutral-500"
                >
                  {formatDate(c.date)}
                </time>
              </header>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {c.body}
              </p>
            </li>
          ))}
        </ol>
      )}

      {/* Add comment form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-5 py-5 space-y-4"
        aria-label="Leave a comment"
        noValidate
      >
        <h3 className="text-sm font-semibold text-neutral-300">
          Leave a comment
        </h3>

        <div>
          <label
            htmlFor="comment-author"
            className="block text-xs text-neutral-500 mb-1"
          >
            Name
          </label>
          <input
            id="comment-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            maxLength={80}
            placeholder="Your name"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2
              text-sm text-neutral-100 placeholder-neutral-600
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="comment-body"
            className="block text-xs text-neutral-500 mb-1"
          >
            Comment
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
            maxLength={1000}
            placeholder="Share your thoughts…"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2
              text-sm text-neutral-100 placeholder-neutral-600 resize-y
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              transition-colors"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-xs text-emerald-400">
            Comment posted. Thanks!
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !author.trim() || !body.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
            bg-amber-400 text-neutral-950 hover:bg-amber-300
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400
            transition-colors"
        >
          {submitting ? "Posting…" : "Post comment"}
        </button>
      </form>
    </section>
  );
}
