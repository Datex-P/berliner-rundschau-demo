import LoadingSpinner from "@/components/LoadingSpinner";

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <LoadingSpinner label="Kategorie wird geladen…" />
    </div>
  );
}
