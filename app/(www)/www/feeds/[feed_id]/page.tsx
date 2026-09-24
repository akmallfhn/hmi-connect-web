import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFeedById,
  listAllFeedComments,
  type FeedUploadAttachment,
} from "@/apis/feeds";
import { resolveFeedAuthor } from "@/lib/feed-author";
import { getSession } from "@/apis/session";
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
  const image = feed.attachments?.find(
    (item): item is FeedUploadAttachment => item.type === "photo",
  )?.reference_url;
  const authorName = resolveFeedAuthor(feed).name;

  return {
    title: `Postingan ${authorName}`,
    description,
    alternates: { canonical: `/feeds/${feed.id}` },
    openGraph: {
      title: `${authorName} | HMI Connect`,
      description,
      url: `/feeds/${feed.id}`,
      type: "article",
      images: image ? [{ url: image, alt: "Media postingan" }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${authorName} | HMI Connect`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function FeedDetailPage({ params }: FeedDetailRouteProps) {
  const { feed_id } = await params;
  const { sessionToken, user } = await getSession();

  const [feed, comments] = await Promise.all([
    getFeedById(feed_id, sessionToken),
    listAllFeedComments(feed_id, { token: sessionToken }),
  ]);

  if (!feed) return notFound();

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={user?.full_name}
        avatar={user?.avatar}
        userId={user?.id}
        username={user?.username}
        verificationStatus={user?.verification_status}
        mobileBackTitle="Postingan"
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <div className="mx-auto grid max-w-[600px] grid-cols-1 gap-1.5 lg:gap-4">
          <main className="min-w-0">
            <FeedItemCard
              feed={feed}
              currentUserId={user?.id}
              currentUserName={user?.full_name}
              currentUserAvatar={user?.avatar}
              userStatus={user?.status}
              verificationStatus={user?.verification_status}
              initialComments={comments}
              defaultShowComments
              showViewPostAction={false}
            />
          </main>
        </div>
      </PageMargin>

      <BottomNav userId={user?.id} username={user?.username} />
    </div>
  );
}
