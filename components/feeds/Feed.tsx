import { listFeeds } from "@/apis/feeds";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";
import FeedTimeline from "./FeedTimeline";
import MobileQuickMenu from "./MobileQuickMenu";
import NewsCard from "./NewsCard";
import SuggestedConnectionsCard from "./SuggestedConnectionsCard";

interface FeedProps {
  fullName?: string;
  avatar?: string;
  currentUserId?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
}

export default async function Feed({
  fullName,
  avatar,
  currentUserId,
  userStatus,
  verificationStatus,
}: FeedProps) {
  const { list, hasMore } = await listFeeds({ page: 1, pageSize: 20 });

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
        newsCard={<NewsCard />}
        suggestedConnectionsCard={<SuggestedConnectionsCard />}
        quickMenu={<MobileQuickMenu />}
      />
    </div>
  );
}
