import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeedById, listAllFeedComments } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import { getUserByUsername, listEducationHistories } from "@/apis/users";
import FeedItemCard from "@/components/feeds/FeedItemCard";
import ProfileSidebar from "@/components/feeds/ProfileSidebar";
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

  const [feed, comments, viewerProfile, educationHistories] =
    await Promise.all([
      getFeedById(feed_id, sessionToken),
      listAllFeedComments(feed_id, { token: sessionToken }),
      user?.username
        ? getUserByUsername(user.username, sessionToken)
        : Promise.resolve(null),
      user?.username
        ? listEducationHistories(user.username)
        : Promise.resolve({ list: [], hasMore: false }),
    ]);

  if (!feed) return notFound();
  const hasViewer = Boolean(user?.id);

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

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <div
          className={[
            "grid grid-cols-1 gap-1.5 lg:gap-4",
            hasViewer
              ? "mx-auto lg:max-w-[900px] lg:grid-cols-[280px_minmax(0,600px)]"
              : "mx-auto lg:max-w-[600px]",
          ].join(" ")}
        >
          {hasViewer && (
            <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
              <ProfileSidebar
                fullName={user?.full_name}
                avatar={user?.avatar}
                headline={viewerProfile?.headline}
                username={user?.username}
                isVerified={user?.is_verified}
                followingCount={viewerProfile?.following_count}
                followersCount={viewerProfile?.followers_count}
                educationHistories={educationHistories.list}
              />
            </aside>
          )}

          <main className="min-w-0">
            <FeedItemCard
              feed={feed}
              currentUserId={user?.id}
              currentUserName={user?.full_name}
              currentUserAvatar={user?.avatar}
              isVerified={user?.is_verified}
              initialComments={comments}
              defaultShowComments
            />
          </main>
        </div>
      </PageMargin>

      <BottomNav userId={user?.id} username={user?.username} />
    </div>
  );
}
