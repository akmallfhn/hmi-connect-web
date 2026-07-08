import { listFeeds } from "@/apis/feeds";
import CreateFeedForms from "../forms/CreateFeedForms";
import FeedTimeline from "./FeedTimeline";
import PromoBanner from "./PromoBanner";

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
    <div className="flex flex-col gap-4">
      <CreateFeedForms fullName={fullName} avatar={avatar} />
      <PromoBanner />
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
