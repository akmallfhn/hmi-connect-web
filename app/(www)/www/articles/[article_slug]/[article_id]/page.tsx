import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleDetail } from "@/apis/articles";
import { getSession } from "@/apis/session";
import ArticleDetailPage from "@/components/pages/ArticleDetailPage";
import { articleReadingMinutes, prepareArticleBody } from "@/lib/article-body";

interface ArticleRouteProps {
  params: Promise<{ article_slug: string; article_id: string }>;
}

// The id resolves the article; the slug is decorative, so canonical always uses the real one.
function articleHref(slug: string, id: string) {
  return `/articles/${slug}/${id}`;
}

export async function generateMetadata({
  params,
}: ArticleRouteProps): Promise<Metadata> {
  const { article_id } = await params;
  const article = await getArticleDetail(article_id);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description =
    article.description ||
    `${article.title} — ditulis oleh ${article.author_name}.`;
  const url = articleHref(article.slug_url, article.id);

  return {
    title: article.title,
    description,
    keywords: article.keywords,
    authors: [{ name: article.author_name }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${article.title} | HMI Connect`,
      description,
      url,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [article.author_name],
      images: article.image_url ? [article.image_url] : undefined,
    },
    twitter: {
      card: article.image_url ? "summary_large_image" : "summary",
      title: `${article.title} | HMI Connect`,
      description,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { article_id } = await params;
  const [article, { user }] = await Promise.all([
    getArticleDetail(article_id),
    getSession(),
  ]);

  if (!article) notFound();

  const blocks = prepareArticleBody(article.body_content);

  return (
    <ArticleDetailPage
      article={article}
      blocks={blocks}
      readingMinutes={articleReadingMinutes(blocks)}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
    />
  );
}
