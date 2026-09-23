import { listFeeds } from "@/apis/feeds";
import { listFollowRecommendations } from "@/apis/users";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import FeedTimeline, { type TimelineInsertion } from "./FeedTimeline";
import MobileQuickMenu from "./MobileQuickMenu";
import NewsCard from "./NewsCard";
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
const NEWS_AFTER = 6;
const SECOND_SUGGESTIONS_AFTER = 13;
const SUGGESTIONS_PER_SLOT = 5;

export default async function Feed({
  fullName,
  avatar,
  currentUserId,
  userStatus,
  verificationStatus,
}: FeedProps) {
  // One fetch sliced per slot — this endpoint ranks, so its page 2 can repeat page 1.
  const [{ list, hasMore }, recommendations] = await Promise.all([
    listFeeds({ page: 1, pageSize: 20 }),
    listFollowRecommendations({ pageSize: SUGGESTIONS_PER_SLOT * 2 }),
  ]);

  const firstSuggestions = recommendations.list.slice(0, SUGGESTIONS_PER_SLOT);
  const secondSuggestions = recommendations.list.slice(SUGGESTIONS_PER_SLOT);

  const insertions: TimelineInsertion[] = [
    ...(firstSuggestions.length > 0
      ? [
          {
            after: FIRST_SUGGESTIONS_AFTER,
            node: <SuggestedConnectionsCarousel connections={firstSuggestions} />,
          },
        ]
      : []),
    { after: NEWS_AFTER, node: <NewsCard />, mobileOnly: true },
    ...(secondSuggestions.length > 0
      ? [
          {
            after: SECOND_SUGGESTIONS_AFTER,
            node: (
              <SuggestedConnectionsCarousel connections={secondSuggestions} />
            ),
          },
        ]
      : []),
  ];

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
