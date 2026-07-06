// Centralized route helpers and navigation data
import type { Category } from "@/types";

export interface NavItem {
  label: string;
  href: string;
}

export const SERVICE_LINKS: NavItem[] = [
  { label: "Kontakt", href: "/kontakt" },
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];

export function buildCategoryNav(categories: Category[]): NavItem[] {
  return categories.map((cat) => ({
    label: cat.name,
    href: `/kategorie/${cat.slug}`,
  }));
}

export const routes = {
  home: "/",
  article: (slug: string): string => `/artikel/${slug}`,
  category: (slug: string): string => `/kategorie/${slug}`,
  author: (slug: string): string => `/autor/${slug}`,
  search: (q?: string): string =>
    q ? `/suche?q=${encodeURIComponent(q)}` : "/suche",
} as const;
