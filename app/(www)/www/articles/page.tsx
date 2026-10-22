import type { Metadata } from "next";
import { listArticleFeed, type ArticleFeedTab } from "@/apis/articles";
import { listNewsArticles } from "@/apis/news";
import { getSession } from "@/apis/session";
import ArticlesPage from "@/components/pages/ArticlesPage";
import ServerQueryHydration from "@/components/query/ServerQueryHydration";

export const metadata: Metadata = {
  title: "Artikel",
  description: "Baca artikel dari kader HMI di HMI Connect.",
};

const FEED_TABS: ArticleFeedTab[] = ["all", "following", "me"];

interface ArticlesRouteProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ArticlesRoute({
  searchParams,
}: ArticlesRouteProps) {
  const { tab } = await searchParams;
  const { user } = await getSession();
  const viewer = {
    fullName: user?.full_name,
    avatar: user?.avatar,
    userId: user?.id,
    username: user?.username,
    verificationStatus: user?.verification_status,
  };
  // News and viewer-scoped article feeds require a session.
  if (user?.id && tab === "news") {
    const news = await listNewsArticles({ page: 1, pageSize: 12 });
    return (
      <ServerQueryHydration
        queryKey={["article-feed", user.id, "news"]}
        data={{ pages: [{ kind: "news", ...news }], pageParams: [1] }}
      >
        <ArticlesPage
          key="news"
          viewer={viewer}
          showPrivateTabs
          activeTab="news"
          initialItems={news.list}
          initialHasMore={news.hasMore}
        />
      </ServerQueryHydration>
    );
  }

  const activeTab = user?.id
    ? (FEED_TABS.find((entry) => entry === tab) ?? "all")
    : "all";
  const articles = await listArticleFeed({ tab: activeTab });

  return (
    <ServerQueryHydration
      queryKey={["article-feed", user?.id ?? "public", activeTab]}
      data={{ pages: [{ kind: "articles", ...articles }], pageParams: [1] }}
    >
      <ArticlesPage
        key={activeTab}
        viewer={viewer}
        activeTab={activeTab}
        showPrivateTabs={Boolean(user?.id)}
        initialItems={articles.list}
        initialHasMore={articles.hasMore}
      />
    </ServerQueryHydration>
  );
}
