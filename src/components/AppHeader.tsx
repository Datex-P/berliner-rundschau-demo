"use client";

import { useState, useId, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";
import type { Navigation } from "@/types";

interface AppHeaderProps {
  navigation: Navigation;
}

export default function AppHeader({ navigation }: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = "";
    menuButtonRef.current?.focus();
  }, []);

  useFocusTrap(menuRef, isMenuOpen, closeMenu);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "";
      return next;
    });
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-50 bg-(--color-bg) border-b border-(--color-border) shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold font-heading text-(--color-primary) hover:text-(--color-primary-hover) transition-colors"
            aria-label="Berliner Rundschau — Zur Startseite"
          >
            Berliner Rundschau
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Hauptnavigation"
          >
            {navigation.primaryMenu.map((item) => {
              const isActive = pathname === item.reference.href;
              return (
                <Link
                  key={item.reference.href}
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
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/suche"
              className="p-2 rounded-lg text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface) transition-colors"
              aria-label="Suche"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              onClick={toggleMenu}
              className="p-2 rounded-lg text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface) transition-colors"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-label={isMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          id={menuId}
          ref={menuRef}
          className="md:hidden border-t border-(--color-border) bg-(--color-bg) absolute inset-x-0 top-16 bottom-0 z-40 h-[calc(100dvh-4rem)] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Hauptnavigation"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeMenu();
          }}
        >
          <nav
            className="px-4 py-4 space-y-1"
            aria-label="Hauptnavigation (Mobil)"
          >
            {navigation.primaryMenu.map((item) => {
              const isActive = pathname === item.reference.href;
              return (
                <Link
                  key={item.reference.href}
                  href={item.reference.href}
                  onClick={closeMenu}
                  className={cn(
                    "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-(--color-primary) bg-(--color-primary-light)"
                      : "text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface)",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.reference.label}
                </Link>
              );
            })}
            <div className="border-t border-(--color-divider) pt-4 mt-4">
              <Link
                href="/suche"
                onClick={closeMenu}
                className="block px-4 py-3 text-base font-medium text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface) rounded-lg transition-colors"
              >
                Suche
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
