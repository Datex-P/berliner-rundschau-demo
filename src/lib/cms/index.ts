import "server-only";
import type { CmsAdapter } from "./types";

export type { CmsAdapter };
export { resolveAdapter } from "./detect";

export async function loadAdapter(name: string): Promise<CmsAdapter> {
  switch (name) {
    case "contentful":
      return (await import("./contentful.adapter")).default;
    case "storyblok":
      return (await import("./storyblok.adapter")).default;
    case "datocms":
      return (await import("./datocms.adapter")).default;
    case "sanity":
      return (await import("./sanity.adapter")).default;
    case "prismic":
      return (await import("./prismic.adapter")).default;
    case "strapi":
      return (await import("./strapi.adapter")).default;
    case "directus":
      return (await import("./directus.adapter")).default;
    case "hygraph":
      return (await import("./hygraph.adapter")).default;
    case "payload":
      return (await import("./payload.adapter")).default;
    case "wordpress":
      return (await import("./wordpress.adapter")).default;
    case "typo3":
      return (await import("./typo3.adapter")).default;
    case "mock":
      return (await import("./mock.adapter")).default;
    default:
      throw new Error(
        `[cms] Unknown adapter: "${name}". Valid: contentful, storyblok, datocms, sanity, prismic, strapi, directus, hygraph, payload, wordpress, typo3, mock`,
      );
  }
}
