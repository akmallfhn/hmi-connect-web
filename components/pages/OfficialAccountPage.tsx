import type { ActivityEntry } from "@/apis/feeds";
import type { SessionUser } from "@/apis/session";
import type { AccessEntityTypeEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import EntitySummarySidebar from "../entity/EntitySummarySidebar";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import OfficialTimeline from "../official/OfficialTimeline";
import { entityProfileHref } from "@/lib/feed-author";

interface OfficialAccountPageProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  name: string;
  imageUrl?: string | null;
  initialItems: ActivityEntry[];
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
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer?.full_name}
        avatar={viewer?.avatar}
        userId={viewer?.id}
        username={viewer?.username}
        verificationStatus={viewer?.verification_status}
        mobileBackTitle={name}
      />

      <PageMargin noMobilePadding className="pb-6 lg:pt-6">
        <div className="mx-auto grid grid-cols-1 gap-1.5 lg:max-w-[900px] lg:grid-cols-[280px_minmax(0,600px)] lg:gap-4">
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <EntitySummarySidebar
              name={name}
              imageUrl={imageUrl}
              href={entityProfileHref(entityType, entityId)}
            />
          </aside>

          <main className="min-w-0">
            <OfficialTimeline
              authorEntity={{ type: entityType, id: entityId, name, imageUrl }}
              initialItems={initialItems}
              initialHasMore={initialHasMore}
              currentUserId={viewer?.id}
              currentUserName={viewer?.full_name}
              currentUserAvatar={viewer?.avatar}
              verificationStatus={viewer?.verification_status}
            />
          </main>
        </div>
      </PageMargin>

      <BottomNav userId={viewer?.id} username={viewer?.username} />
    </div>
  );
}
