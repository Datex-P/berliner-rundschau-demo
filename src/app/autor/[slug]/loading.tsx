import LoadingSpinner from "@/components/LoadingSpinner";

export default function AuthorLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <LoadingSpinner label="Autor wird geladen…" />
    </div>
  );
}
