import "server-only";
import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "iframe", "figure", "figcaption", "video", "audio", "source",
    "picture", "table", "thead", "tbody", "tfoot", "th", "td", "tr",
    "details", "summary", "mark", "time", "abbr"
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen", "loading"],
    video: ["src", "poster", "controls", "width", "height"],
    audio: ["src", "controls"],
    source: ["src", "type", "srcset", "sizes", "media"],
    img: ["src", "alt", "width", "height", "loading", "decoding", "srcset", "sizes"],
    time: ["datetime"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
  },
  allowedSchemes: ["http", "https"],
  allowedIframeHostnames: [
    "www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com",
    "platform.twitter.com", "www.instagram.com", "open.spotify.com"
  ],
};

export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
