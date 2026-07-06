interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({
  label = "Inhalt wird geladen…",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-12"
    >
      <div
        className="w-8 h-8 border-3 border-(--color-border) border-t-(--color-primary) rounded-full animate-spin"
        aria-hidden="true"
      />
      <p className="mt-3 text-sm text-(--color-text-secondary)">{label}</p>
    </div>
  );
}
