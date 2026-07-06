// Scaffold: SkipLink — Accessibility Skip-Navigation
// Addressiert: D3-Accessibility (Skip-Link)
// Server Component — kein State noetig.
//
// WICHTIG: Default-Label ist English. Projects in anderen Locales MUESSEN
// label explizit setzen (z.B. label="Zum Inhalt springen" in de-DE layout).

interface SkipLinkProps {
  /** ID des Ziel-Elements (ohne #) */
  targetId?: string;
  /** Sichtbarer Text beim Fokus — locale-spezifisch ueberschreiben */
  label?: string;
}

export default function SkipLink({
  targetId = "main-content",
  label = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {label}
    </a>
  );
}
