import type { Metadata } from "next";
import NewsPage from "@/components/pages/NewsPage";
import { getSession } from "@/apis/session";
import { listNewsArticles, listNewsCategories } from "@/apis/news";

interface NewsCategoryPageProps {
  params: Promise<{ category_slug: string }>;
}

export async function generateMetadata({
  params,
}: NewsCategoryPageProps): Promise<Metadata> {
  const { category_slug } = await params;
  const { list } = await listNewsCategories({ pageSize: 50 });
  const category = list.find((item) => item.slug === category_slug);
  const title = category?.name ?? "Kabar HMI";

  return {
    title,
    description: `Kabar HMI seputar ${title}, dirangkum dari berbagai sumber.`,
    alternates: {
      canonical: `/news/${category_slug}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function NewsCategory({ params }: NewsCategoryPageProps) {
  const { category_slug } = await params;
  const { user } = await getSession();

  const [categories, articles] = await Promise.all([
    listNewsCategories({ pageSize: 50 }),
    listNewsArticles({ page: 1, pageSize: 12, categorySlug: category_slug }),
  ]);

  return (
    <NewsPage
      key={category_slug}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        isVerified: user?.is_verified,
      }}
      categories={categories.list}
      activeCategorySlug={category_slug}
      initialItems={articles.list}
      initialHasMore={articles.hasMore}
    />
  );
}
