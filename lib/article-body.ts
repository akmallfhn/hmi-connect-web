import "server-only";

import sanitizeHtml from "sanitize-html";

const WORDS_PER_MINUTE = 200;

// Any verified user may author an article, so body HTML is untrusted — allowlist, never raw.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "ul",
    "ol",
    "li",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "code",
    "pre",
    "a",
    "img",
    "figure",
    "figcaption",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Anything pointing off-site opens in a new tab and can't reach window.opener.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    }),
    // The page title already owns the document's only h1, so an authored one steps down to h2.
    h1: "h2",
  },
  disallowedTagsMode: "discard",
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

// The whole body is one untrusted HTML string, sanitized once server-side.
export function prepareArticleBody(
  html: string | null | undefined
): string | null {
  if (!html?.trim()) return null;
  return sanitizeArticleHtml(html).trim() || null;
}

export function articleReadingMinutes(html: string | null): number {
  const text = html ? stripTags(html) : "";
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function stripTags(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
}
