import { listFeeds } from "@/apis/feeds";
import FeedTimeline from "./FeedTimeline";

interface FeedProps {
  fullName?: string;
  avatar?: string;
  currentUserId?: string;
  isVerified?: boolean;
}

export default async function Feed({
  fullName,
  avatar,
  currentUserId,
  isVerified,
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
        isVerified={isVerified}
      />
    </div>
  );
}
