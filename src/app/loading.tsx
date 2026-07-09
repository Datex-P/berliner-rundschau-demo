export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero skeleton */}
      <div className="rounded-xl overflow-hidden bg-(--color-surface) animate-pulse">
        <div className="aspect-[21/9] bg-(--color-border)" />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article grid skeleton */}
        <div className="lg:col-span-2">
          <div className="h-8 w-48 bg-(--color-border) rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-(--color-surface) border border-(--color-border) animate-pulse"
              >
                <div className="aspect-video bg-(--color-border)" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 bg-(--color-border) rounded" />
                  <div className="h-5 w-full bg-(--color-border) rounded" />
                  <div className="h-4 w-3/4 bg-(--color-border) rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <aside className="space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-28 bg-(--color-border) rounded" />
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="space-y-2 py-3 border-b border-(--color-divider)"
              >
                <div className="h-3 w-16 bg-(--color-border) rounded" />
                <div className="h-4 w-full bg-(--color-border) rounded" />
              </div>
            ))}
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-20 bg-(--color-border) rounded" />
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="h-4 w-24 bg-(--color-border) rounded" />
                <div className="h-4 w-16 bg-(--color-border) rounded" />
              </div>
            ))}
          </div>
        </aside>
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        Inhalt wird geladen…
      </span>
    </div>
  );
}
