// Scaffold: ExternalLink — External Link with noopener noreferrer + SR hint
// Server Component — kein State noetig.
//
// WICHTIG: Default srHintLabel ist English. Projects in anderen Locales MUESSEN
// srHintLabel explizit setzen (z.B. srHintLabel="(oeffnet in neuem Tab)" in de-DE).

import type { ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  className?: string;
  srHintLabel?: string;
  children: ReactNode;
}

export default function ExternalLink({
  href,
  className,
  srHintLabel = "(opens in new tab)",
  children,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only">{srHintLabel}</span>
    </a>
  );
}
