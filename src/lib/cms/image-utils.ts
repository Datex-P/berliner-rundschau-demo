import type { ArticleImage } from "@/types";

export function normalizeImage(
  src: string | null | undefined,
  alt?: string,
  width?: number,
  height?: number,
): ArticleImage {
  const url = typeof src === "string" && src.trim() ? src.trim() : "";
  return {
    alt: alt ?? "",
    fallbackSrc: url,
    crops: url
      ? [
          {
            name: "default",
            srcset: [
              { src: url, imageWidth: width ? `${width}w` : "1200w" },
            ],
          },
        ]
      : [],
    sizes: url ? ["(max-width: 768px) 100vw", "800px"] : [],
  };
}
