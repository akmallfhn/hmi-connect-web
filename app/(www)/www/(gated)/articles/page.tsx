import type { Metadata } from "next";
import { listArticleFeed, type ArticleFeedTab } from "@/apis/articles";
import { getSession } from "@/apis/session";
import ArticlesPage from "@/components/pages/ArticlesPage";

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
  const activeTab = FEED_TABS.find((entry) => entry === tab) ?? "all";

  const [{ user }, articles] = await Promise.all([
    getSession(),
    listArticleFeed({ tab: activeTab }),
  ]);

  return (
    <ArticlesPage
      key={activeTab}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
      activeTab={activeTab}
      initialItems={articles.list}
      initialHasMore={articles.hasMore}
    />
  );
}
