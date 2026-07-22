"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPost } from "@/lib/api";

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
}

const EMPTY: FormState = { title: "", slug: "", excerpt: "", body: "" };

/** Auto-generate a URL-safe slug from a title string. */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugManual, setSlugManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-derive slug from title unless the user has edited it manually
      if (name === "title" && !slugManual) {
        next.slug = toSlug(value);
      }
      if (name === "slug") {
        setSlugManual(true);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.body.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const post = await createPost({
        title: form.title.trim(),
        slug: form.slug.trim(),
        body: form.body.trim(),
        excerpt: form.excerpt.trim(),
      });
      router.push(`/posts/${post.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post.");
      setSubmitting(false);
    }
  }

  const canSubmit =
    form.title.trim() && form.slug.trim() && form.body.trim() && !submitting;

  const fieldClass =
    "w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 " +
    "text-sm text-neutral-100 placeholder-neutral-600 " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent " +
    "transition-colors";

  return (
    <div>
      <Link
        href="/"
        className="text-xs text-neutral-500 hover:text-amber-400 transition-colors mb-8 inline-flex items-center gap-1"
      >
        <span aria-hidden="true">&larr;</span> All posts
      </Link>

      <h1 className="font-lora text-3xl font-semibold text-white mt-6 mb-8">
        New post
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="Create a new post"
        noValidate
      >
        {/* Title */}
        <div>
          <label
            htmlFor="post-title"
            className="block text-xs font-medium text-neutral-400 mb-1"
          >
            Title <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="post-title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            maxLength={200}
            placeholder="Your post title"
            className={fieldClass}
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="post-slug"
            className="block text-xs font-medium text-neutral-400 mb-1"
          >
            Slug <span aria-hidden="true" className="text-red-400">*</span>
            <span className="ml-2 font-normal text-neutral-600">
              (auto-generated, editable)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600 shrink-0">/posts/</span>
            <input
              id="post-slug"
              name="slug"
              type="text"
              required
              value={form.slug}
              onChange={handleChange}
              maxLength={200}
              placeholder="my-post-slug"
              pattern="[a-z0-9-]+"
              className={fieldClass}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="post-excerpt"
            className="block text-xs font-medium text-neutral-400 mb-1"
          >
            Excerpt
            <span className="ml-2 font-normal text-neutral-600">
              (shown on the listing page)
            </span>
          </label>
          <textarea
            id="post-excerpt"
            name="excerpt"
            rows={2}
            value={form.excerpt}
            onChange={handleChange}
            maxLength={400}
            placeholder="A short summary of the post…"
            className={`${fieldClass} resize-y`}
          />
        </div>

        {/* Body (markdown) */}
        <div>
          <label
            htmlFor="post-body"
            className="block text-xs font-medium text-neutral-400 mb-1"
          >
            Body (Markdown){" "}
            <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <textarea
            id="post-body"
            name="body"
            rows={16}
            required
            value={form.body}
            onChange={handleChange}
            placeholder="# Your post heading&#10;&#10;Write your post in Markdown…"
            className={`${fieldClass} resize-y font-mono text-xs leading-relaxed`}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium
              bg-amber-400 text-neutral-950 hover:bg-amber-300
              disabled:opacity-50 disabled:cursor-not-allowed
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400
              transition-colors"
          >
            {submitting ? "Publishing…" : "Publish post"}
          </button>
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
