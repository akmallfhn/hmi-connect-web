import type { Metadata } from "next";
import NewsPage from "@/components/pages/NewsPage";
import { getSession } from "@/apis/session";
import { listNewsArticles, listNewsCategories } from "@/apis/news";

const description =
  "Kabar terbaru seputar HMI dan kader-kadernya, dirangkum dari berbagai sumber.";

export const metadata: Metadata = {
  title: "Kabar HMI",
  description,
  alternates: {
    canonical: "/news",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function News() {
  const { user } = await getSession();

  const [categories, articles] = await Promise.all([
    listNewsCategories({ pageSize: 50 }),
    listNewsArticles({ page: 1, pageSize: 12 }),
  ]);

  return (
    <NewsPage
      key="all"
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        isVerified: user?.is_verified,
      }}
      categories={categories.list}
      initialItems={articles.list}
      initialHasMore={articles.hasMore}
    />
  );
}
