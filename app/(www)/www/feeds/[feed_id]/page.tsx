import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeedById } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import { getUserByUsername } from "@/apis/users";
import FeedItemCard from "@/components/feeds/FeedItemCard";
import PageMargin from "@/components/common/PageMargin";
import BottomNav from "@/components/navigations/BottomNav";
import Header from "@/components/navigations/Header";

interface FeedDetailRouteProps {
  params: Promise<{ feed_id: string }>;
}

export async function generateMetadata({
  params,
}: FeedDetailRouteProps): Promise<Metadata> {
  const { feed_id } = await params;
  const feed = await getFeedById(feed_id);

  if (!feed) {
    return {
      title: "Postingan Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description =
    feed.content.length > 140
      ? `${feed.content.slice(0, 137)}...`
      : feed.content;
  const image = feed.media?.find((item) => item.type === "photo")?.url;

  return {
    title: `Postingan ${feed.creator_full_name}`,
    description,
    alternates: { canonical: `/feeds/${feed.id}` },
    openGraph: {
      title: `${feed.creator_full_name} | HMI Connect`,
      description,
      url: `/feeds/${feed.id}`,
      type: "article",
      images: image ? [{ url: image, alt: "Media postingan" }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${feed.creator_full_name} | HMI Connect`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function FeedDetailPage({ params }: FeedDetailRouteProps) {
  const { feed_id } = await params;
  const { sessionToken, user } = await getSession();

  const [feed, viewerProfile] = await Promise.all([
    getFeedById(feed_id, sessionToken),
    user?.username
      ? getUserByUsername(user.username, sessionToken)
      : Promise.resolve(null),
  ]);

  if (!feed) return notFound();

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={user?.full_name}
        avatar={user?.avatar}
        email={viewerProfile?.email}
        userId={user?.id}
        username={user?.username}
        isVerified={user?.is_verified}
      />

      <PageMargin
        noMobilePadding
        className="py-6 lg:max-w-[820px] xl:max-w-[820px]"
      >
        <FeedItemCard
          feed={feed}
          currentUserId={user?.id}
          currentUserName={user?.full_name}
          currentUserAvatar={user?.avatar}
          isVerified={user?.is_verified}
        />
      </PageMargin>

      <BottomNav
        username={user?.username}
        avatar={user?.avatar}
        fullName={user?.full_name}
      />
    </div>
  );
}
