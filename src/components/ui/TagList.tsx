import { cn } from "@/lib/utils";

interface TagListProps {
  tags: string[];
  className?: string;
}

export default function TagList({ tags, className = "" }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="list"
      aria-label="Schlagwörter"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          role="listitem"
          className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-(--color-surface-elevated) text-(--color-text-secondary) border border-(--color-border)"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
