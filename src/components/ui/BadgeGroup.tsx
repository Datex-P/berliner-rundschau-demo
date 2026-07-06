import Link from "next/link";
import { routes } from "@/lib/navigation";
import type { ArticleCategory } from "@/types";

interface BadgeGroupProps {
  category?: ArticleCategory;
  isPremium?: boolean;
  isBreaking?: boolean;
  isOpinion?: boolean;
}

export default function BadgeGroup({
  category,
  isPremium,
  isBreaking,
  isOpinion,
}: BadgeGroupProps) {
  const hasBadges = isBreaking || category || isPremium || isOpinion;
  if (!hasBadges) return null;

  return (
    <ul
      role="list"
      className="flex flex-wrap items-center gap-2 list-none p-0 m-0"
    >
      {isBreaking && (
        <li>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-(--color-accent) text-(--color-text-inverse)">
            <span
              className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
              aria-hidden="true"
            />
            Eilmeldung
          </span>
        </li>
      )}
      {category && (
        <li>
          <Link
            href={routes.category(category.slug)}
            className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-(--color-primary-light) text-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-on-primary) transition-colors"
          >
            {category.name}
          </Link>
        </li>
      )}
      {isPremium && (
        <li>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-(--color-warning-light) text-(--color-warning-text)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
            </svg>
            Premium
          </span>
        </li>
      )}
      {isOpinion && (
        <li>
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-(--color-info-light) text-(--color-info-text)">
            Kommentar
          </span>
        </li>
      )}
    </ul>
  );
}
