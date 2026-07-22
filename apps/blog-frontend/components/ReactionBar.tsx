"use client";

import { useState } from "react";
import { addReaction, ReactionMap } from "@/lib/api";

const EMOJI_LIST: { emoji: string; label: string }[] = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "🔥", label: "Fire" },
];

interface Props {
  postId: string;
  initial: ReactionMap;
}

export default function ReactionBar({ postId, initial }: Props) {
  const [counts, setCounts] = useState<ReactionMap>(initial);
  const [reacted, setReacted] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<string | null>(null);

  async function handleReact(emoji: string) {
    if (pending) return;

    // Optimistic update
    const alreadyReacted = reacted.has(emoji);
    setCounts((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] ?? 0) + (alreadyReacted ? -1 : 1),
    }));
    setReacted((prev) => {
      const next = new Set(prev);
      alreadyReacted ? next.delete(emoji) : next.add(emoji);
      return next;
    });

    setPending(emoji);
    try {
      await addReaction(postId, emoji);
    } catch {
      // Roll back on failure
      setCounts((prev) => ({
        ...prev,
        [emoji]: (prev[emoji] ?? 0) + (alreadyReacted ? 1 : -1),
      }));
      setReacted((prev) => {
        const next = new Set(prev);
        alreadyReacted ? next.add(emoji) : next.delete(emoji);
        return next;
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <div
      className="flex items-center gap-3 py-6 border-t border-neutral-800"
      role="group"
      aria-label="Post reactions"
    >
      <span className="text-xs text-neutral-500 mr-1">React:</span>
      {EMOJI_LIST.map(({ emoji, label }) => {
        const active = reacted.has(emoji);
        const count = counts[emoji] ?? 0;
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={pending !== null}
            aria-label={`${label} — ${count} reaction${count !== 1 ? "s" : ""}${active ? " (active)" : ""}`}
            aria-pressed={active}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
              "border transition-all duration-150 focus-visible:outline focus-visible:outline-2",
              "focus-visible:outline-amber-400 disabled:cursor-not-allowed",
              active
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200",
            ].join(" ")}
          >
            <span aria-hidden="true">{emoji}</span>
            <span className="tabular-nums">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
