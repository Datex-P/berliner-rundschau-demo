"use client";

import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { formatRelativeDate, formatReadingTime } from "@/lib/format";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { ArticleAuthor } from "@/types";

interface ArticleMetaProps {
  author: ArticleAuthor;
  publicationDate: string;
  readingTimeMinutes?: number;
  variant?: "default" | "light";
  className?: string;
}

export default function ArticleMeta({
  author,
  publicationDate,
  readingTimeMinutes,
  variant = "default",
  className = "",
}: ArticleMetaProps) {
  const textColor =
    variant === "light"
      ? "text-(--color-on-overlay)/70"
      : "text-(--color-text-secondary)";

  return (
    <div
      className={cn("flex items-center gap-2 text-sm", textColor, className)}
    >
      {variant === "default" && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden">
          <SafeImage
            src={author.avatar}
            alt={author.name}
            width={24}
            height={24}
            sizes="24px"
            className="object-cover w-full h-full"
            unavailableLabel=""
          />
        </div>
      )}
      <Link
        href={routes.author(author.slug)}
        className={cn(
          "font-medium hover:underline",
          variant === "light"
            ? "text-(--color-on-overlay)"
            : "text-(--color-text)",
        )}
      >
        {author.name}
      </Link>
      <span aria-hidden="true">&middot;</span>
      <time dateTime={publicationDate} suppressHydrationWarning>
        {formatRelativeDate(publicationDate)}
      </time>
      {readingTimeMinutes != null && readingTimeMinutes > 0 && (
        <>
          <span aria-hidden="true">&middot;</span>
          <span>{formatReadingTime(readingTimeMinutes)}</span>
        </>
      )}
    </div>
  );
}
