"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { Config } from "dompurify";

// Auto-rel="noopener noreferrer" auf target="_blank" Links — verhindert window.opener-Angriffe.
// Hook wird global registriert (idempotent) und greift bei jeder sanitize()-Operation.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

interface SanitizedHtmlProps {
  /** Unsicherer HTML-String der bereinigt werden soll */
  html: string;
  className?: string;
  /** HTML-Element das gerendert wird */
  as?: "div" | "span" | "article" | "section";
}

const PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "a",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "figure",
    "figcaption",
    "img",
    "code",
    "pre",
    "span",
    "sub",
    "sup",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "time",
    "dl",
    "dt",
    "dd",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel",
    "src",
    "alt",
    "width",
    "height",
    "loading",
    "decoding",
    "datetime",
  ],
  ALLOW_DATA_ATTR: false,
};

export default function SanitizedHtml({
  html,
  className,
  as: Element = "div",
}: SanitizedHtmlProps) {
  const sanitized = useMemo(
    () => DOMPurify.sanitize(html, PURIFY_CONFIG),
    [html],
  );

  return (
    <Element
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
