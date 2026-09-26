import { listArticles } from "@/apis/articles";
import { collectPages, urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Published articles only (articles/list), at the real slug the reader's canonical tag points to.
export async function GET() {
  const articles = await collectPages((page, pageSize) =>
    listArticles({ page, pageSize }),
  );

  return urlsetResponse(
    articles.map((article) => ({
      path: `/articles/${article.slug_url || "artikel"}/${article.id}`,
      lastModified: article.updated_at,
      images: article.image_url ? [article.image_url] : undefined,
    })),
  );
}
