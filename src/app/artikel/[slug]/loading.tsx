import LoadingSpinner from "@/components/LoadingSpinner";

export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <LoadingSpinner label="Artikel wird geladen…" />
    </div>
  );
}
