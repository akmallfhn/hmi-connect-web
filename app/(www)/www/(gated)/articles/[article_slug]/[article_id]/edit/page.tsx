import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getArticleDetail, listArticleCategories } from "@/apis/articles";
import { getSession } from "@/apis/session";
import ArticleComposerPage from "@/components/pages/ArticleComposerPage";
import PageState from "@/components/states/PageState";
import { isSuperAdmin } from "@/lib/access";
import { prepareArticleBody } from "@/lib/article-body";

export const metadata: Metadata = {
  title: "Edit Artikel",
  description: "Perbarui artikel yang sudah kamu tulis di HMI Connect.",
  robots: { index: false, follow: false },
};

interface EditArticleRouteProps {
  params: Promise<{ article_slug: string; article_id: string }>;
}

export default async function EditArticleRoute({
  params,
}: EditArticleRouteProps) {
  const { article_slug, article_id } = await params;
  const [{ user }, article, categories] = await Promise.all([
    getSession(),
    getArticleDetail(article_id),
    listArticleCategories({ pageSize: 100 }),
  ]);

  // articles/.* is allowlisted in next.config.mts, so this route owns its own login bounce.
  if (!user?.id) {
    redirect(
      `/auth/login?redirectTo=/articles/${article_slug}/${article_id}/edit`
    );
  }
  if (!article) notFound();

  // Same rule articles/update enforces: the author, or a Super Admin.
  if (article.author_id !== user.id && !isSuperAdmin(user)) {
    return (
      <PageState
        variant="forbidden"
        message="Artikel ini ditulis oleh orang lain, jadi kamu tidak bisa mengubahnya."
        backHref={`/articles/${article.slug_url || "artikel"}/${article.id}`}
      />
    );
  }

  return (
    <ArticleComposerPage
      author={{
        id: user.id,
        fullName: user.full_name ?? "Penulis",
        avatar: user.avatar,
      }}
      categories={categories.list}
      draft={{
        id: article.id,
        title: article.title,
        description: article.description ?? "",
        imageUrl: article.image_url,
        // Sanitized here so another author's raw HTML never reaches the editor's own parser.
        bodyHtml: prepareArticleBody(article.body_content) ?? "",
        categoryId: article.category_id,
        keywords: article.keywords
          ? article.keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
          : [],
      }}
    />
  );
}
