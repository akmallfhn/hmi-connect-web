import type { ArticleListEntry } from "@/apis/articles";
import type { ComposerArticleDraft } from "../forms/CreateFeedForms";

// One mapper keeps article attachments identical whether reposted from the index or detail page.
export function articleComposeDraft(
  article: ArticleListEntry,
): ComposerArticleDraft {
  return {
    id: article.id,
    title: article.title,
    slugUrl: article.slug_url,
    imageUrl: article.image_url,
    description: article.description ?? undefined,
    categoryName: article.category_name,
    authorName: article.author_name,
    authorAvatar: article.author_avatar,
  };
}
