import type { FeedTimelineItem } from "@/apis/feeds";
import type { SessionUser } from "@/apis/session";
import type { AccessEntityTypeEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import OfficialTimeline from "../official/OfficialTimeline";

interface OfficialAccountPageProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  name: string;
  imageUrl?: string | null;
  initialItems: FeedTimelineItem[];
  initialHasMore: boolean;
  viewer: SessionUser | null;
}

export default function OfficialAccountPage({
  entityType,
  entityId,
  name,
  imageUrl,
  initialItems,
  initialHasMore,
  viewer,
}: OfficialAccountPageProps) {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={viewer?.full_name}
        avatar={viewer?.avatar}
        userId={viewer?.id}
        username={viewer?.username}
        verificationStatus={viewer?.verification_status}
        mobileBackTitle={name}
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        {/* The desktop rail carries Timeline and Profile here, so the page is one centered column. */}
        <div className="mx-auto lg:max-w-[600px]">
          <main className="min-w-0">
            <OfficialTimeline
              authorEntity={{ type: entityType, id: entityId, name, imageUrl }}
              initialItems={initialItems}
              initialHasMore={initialHasMore}
              currentUserId={viewer?.id}
              currentUserName={viewer?.full_name}
              currentUserAvatar={viewer?.avatar}
              userStatus={viewer?.status}
              verificationStatus={viewer?.verification_status}
            />
          </main>
        </div>
      </PageMargin>

      <BottomNav userId={viewer?.id} username={viewer?.username} />
    </div>
  );
}
