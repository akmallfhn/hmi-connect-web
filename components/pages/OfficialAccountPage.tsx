import type { FeedTimelineItem } from "@/apis/feeds";
import type { SessionUser } from "@/apis/session";
import { withActingEntity } from "@/lib/access";
import { entityProfileHref } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import { ActingEntityProvider } from "@/hooks/useActingEntity";
import OfficialBottomNav from "../official/OfficialBottomNav";
import OfficialGreetingBar from "../official/OfficialGreetingBar";
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
  const profileHref = withActingEntity(
    entityProfileHref(entityType, entityId),
    {
      entityType,
      entityId,
    },
  );
  const authorEntity = { type: entityType, id: entityId, name, imageUrl };

  // No personal Header or BottomNav here: on mobile the entity gets its own greeting and tab bar.
  return (
    <ActingEntityProvider entity={authorEntity}>
      <div className="min-h-screen bg-white pb-16 lg:pb-0">
        <OfficialGreetingBar
          name={name}
          imageUrl={imageUrl}
          profileHref={profileHref}
        />

        <PageMargin noMobilePadding className="pb-6 lg:pt-6">
          {/* The desktop rail carries Timeline and Profile here, so the page is one centered column. */}
          <div className="mx-auto lg:max-w-[600px]">
            <main className="min-w-0">
              <OfficialTimeline
                authorEntity={authorEntity}
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

        <OfficialBottomNav entityType={entityType} entityId={entityId} />
      </div>
    </ActingEntityProvider>
  );
}
