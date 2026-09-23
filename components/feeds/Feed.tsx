import { listFeeds } from "@/apis/feeds";
import { listNewsArticles } from "@/apis/news";
import { listFollowRecommendations } from "@/apis/users";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import FeedTimeline, { type TimelineInsertion } from "./FeedTimeline";
import MobileQuickMenu from "./MobileQuickMenu";
import NewsCarousel from "./NewsCarousel";
import SuggestedConnectionsCarousel from "./SuggestedConnectionsCarousel";

interface FeedProps {
  fullName?: string;
  avatar?: string;
  currentUserId?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
}

// Feed indices the inline cards sit after — early enough to be seen, then widening out.
const FIRST_SUGGESTIONS_AFTER = 1;
const FIRST_NEWS_AFTER = 6;
const SECOND_NEWS_AFTER = 13;
const SECOND_SUGGESTIONS_AFTER = 20;
const ITEMS_PER_SLOT = 5;

export default async function Feed({
  fullName,
  avatar,
  currentUserId,
  userStatus,
  verificationStatus,
}: FeedProps) {
  // One fetch sliced per slot — recommendations rank, so their page 2 can repeat page 1.
  const [{ list, hasMore }, recommendations, news] = await Promise.all([
    listFeeds({ page: 1, pageSize: 20 }),
    listFollowRecommendations({ pageSize: ITEMS_PER_SLOT * 2 }),
    listNewsArticles({ pageSize: ITEMS_PER_SLOT * 2 }),
  ]);

  const firstSuggestions = recommendations.list.slice(0, ITEMS_PER_SLOT);
  const secondSuggestions = recommendations.list.slice(ITEMS_PER_SLOT);
  const firstNews = news.list.slice(0, ITEMS_PER_SLOT);
  const secondNews = news.list.slice(ITEMS_PER_SLOT);

  // Built in reading order, since a slot the timeline never reaches renders below the last post.
  const insertions: TimelineInsertion[] = [];
  if (firstSuggestions.length > 0) {
    insertions.push({
      after: FIRST_SUGGESTIONS_AFTER,
      node: <SuggestedConnectionsCarousel connections={firstSuggestions} />,
    });
  }
  if (firstNews.length > 0) {
    insertions.push({
      after: FIRST_NEWS_AFTER,
      node: <NewsCarousel articles={firstNews} />,
    });
  }
  if (secondNews.length > 0) {
    insertions.push({
      after: SECOND_NEWS_AFTER,
      node: <NewsCarousel articles={secondNews} />,
    });
  }
  if (secondSuggestions.length > 0) {
    insertions.push({
      after: SECOND_SUGGESTIONS_AFTER,
      node: <SuggestedConnectionsCarousel connections={secondSuggestions} />,
    });
  }

  return (
    <div className="flex flex-col gap-1.5 lg:gap-4">
      <FeedTimeline
        initialItems={list}
        initialHasMore={hasMore}
        currentUserId={currentUserId}
        currentUserName={fullName}
        currentUserAvatar={avatar}
        userStatus={userStatus}
        verificationStatus={verificationStatus}
        insertions={insertions}
        quickMenu={<MobileQuickMenu />}
      />
    </div>
  );
}
