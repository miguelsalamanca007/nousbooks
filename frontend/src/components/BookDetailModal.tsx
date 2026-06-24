"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "@/components/Modal";
import AddToLibraryButton from "@/components/AddToLibraryButton";

export interface BookDetail {
  title: string;
  authors?: string[];
  publisher?: string;
  thumbnail?: string;
  publishedDate?: string;
  description?: string;
}

// Google Books thumbnails default to zoom=1 (small). zoom=0 returns a larger
// cover for most volumes, but some volumes only have the small image and
// zoom=0 falls back to a "no image available" placeholder. We try the larger
// variant first and let the <Image> onError swap to the original.
function largeThumb(url: string) {
  return url.replace(/zoom=\d/, "zoom=0").replace(/&edge=curl/, "");
}

// Google Books descriptions arrive with embedded HTML (<b>, <i>, <br>, etc.).
// Strip the tags and decode the handful of entities that show up so the text
// renders cleanly without dangerouslySetInnerHTML.
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface Props {
  book: BookDetail;
  onClose: () => void;
  /** When provided, renders an "+ Add to library" button. */
  onAdd?: () => void;
  isAdding?: boolean;
  isAdded?: boolean;
  /** When provided, renders an "+ Add highlight" button. */
  onAddHighlight?: () => void;
}

export default function BookDetailModal({
  book,
  onClose,
  onAdd,
  isAdding,
  isAdded,
  onAddHighlight,
}: Props) {
  const [coverSrc, setCoverSrc] = useState(
    book.thumbnail ? largeThumb(book.thumbnail) : undefined,
  );
  const description = book.description ? stripHtml(book.description) : "";

  return (
    <Modal open title={book.title} onClose={onClose} size="lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Cover */}
        <div className="flex shrink-0 justify-center sm:justify-start">
          {coverSrc ? (
            <div className="relative h-[230px] w-[160px] shrink-0">
              <Image
                src={coverSrc}
                alt={book.title}
                fill
                unoptimized
                onError={() => {
                  if (book.thumbnail && coverSrc !== book.thumbnail) {
                    setCoverSrc(book.thumbnail);
                  }
                }}
                onLoad={(e) => {
                  // Google Books returns its "image not available" placeholder
                  // with HTTP 200, so onError won't fire. The placeholder is
                  // narrow (~128px); real zoom=0 covers are at least ~300px.
                  // Fall back to the original thumbnail if we got the stub.
                  const img = e.currentTarget;
                  if (
                    img.naturalWidth > 0 &&
                    img.naturalWidth < 200 &&
                    book.thumbnail &&
                    coverSrc !== book.thumbnail
                  ) {
                    setCoverSrc(book.thumbnail);
                  }
                }}
                className="rounded-xl object-cover shadow-2xl shadow-amber-900/30 ring-1 ring-black/10"
              />
            </div>
          ) : (
            <div className="flex h-[230px] w-[160px] items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-12 w-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          {book.authors && book.authors.length > 0 && (
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {book.authors.join(", ")}
            </p>
          )}

          {book.publisher && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {book.publisher}
            </p>
          )}

          {book.publishedDate && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {book.publishedDate.slice(0, 4)}
            </p>
          )}

          {description ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {description}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-zinc-400 dark:text-zinc-500">
              No description available.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {onAdd && (
              <AddToLibraryButton
                size="md"
                isAdding={!!isAdding}
                isAdded={!!isAdded}
                onAdd={onAdd}
              />
            )}
            {onAddHighlight && (
              <button
                onClick={onAddHighlight}
                className="rounded-full border border-amber-300/80 bg-amber-50/70 px-4 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/40"
              >
                + Add highlight
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
