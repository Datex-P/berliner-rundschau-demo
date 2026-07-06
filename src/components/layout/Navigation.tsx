"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface NavigationProps {
  items: MenuItem[];
  currentPath?: string;
  className?: string;
}

export default function Navigation({ items, className = "" }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Hauptnavigation">
      <ul className="flex items-center gap-1" role="list">
        {items.map((item) => {
          const isActive = pathname === item.reference.href;
          return (
            <li key={item.reference.href}>
              <Link
                href={item.reference.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-(--color-primary) bg-(--color-primary-light)"
                    : "text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface)",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.reference.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
