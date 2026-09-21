import "server-only";

import sanitizeHtml from "sanitize-html";
import type { ArticleBodyBlock } from "@/apis/articles";

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
  },
  disallowedTagsMode: "discard",
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export type RenderableArticleBlock = {
  key: string;
  subHeading: string | null;
  imagePath: string | null;
  imageDesc: string | null;
  html: string | null;
};

// Sorted by index_order, sanitized, and with fully empty blocks dropped.
export function prepareArticleBody(
  blocks: ArticleBodyBlock[] | null | undefined
): RenderableArticleBlock[] {
  if (!blocks?.length) return [];

  return blocks
    .slice()
    .sort((a, b) => a.index_order - b.index_order)
    .map((block, index) => {
      const html = block.content ? sanitizeArticleHtml(block.content) : null;
      return {
        key: `${block.index_order}-${index}`,
        subHeading: block.sub_heading?.trim() || null,
        imagePath: block.image_path?.trim() || null,
        imageDesc: block.image_desc?.trim() || null,
        html: html?.trim() || null,
      };
    })
    .filter(
      (block) =>
        block.subHeading !== null ||
        block.imagePath !== null ||
        block.html !== null
    );
}

export function articleReadingMinutes(
  blocks: RenderableArticleBlock[]
): number {
  const words = blocks.reduce((total, block) => {
    const text = [block.subHeading, block.html ? stripTags(block.html) : null]
      .filter(Boolean)
      .join(" ");
    if (!text) return total;
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function stripTags(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
}
