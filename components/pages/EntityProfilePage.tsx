import type { ActivityEntry } from "@/apis/feeds";
import type { SessionUser } from "@/apis/session";
import type { StructuralPeriodDetail } from "@/apis/structurals";
import { entityProfileHref } from "@/lib/feed-author";
import type { AccessEntityTypeEnum, BranchTypeEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import EntityChildrenCard, {
  type EntityChildItem,
} from "../entity/EntityChildrenCard";
import EntityInfoCard, { type EntityInfoField } from "../entity/EntityInfoCard";
import EntityProfileHeader, {
  type EntityAffiliation,
  type EntityStat,
} from "../entity/EntityProfileHeader";
import EntityStructuralCard from "../entity/EntityStructuralCard";
import SuggestedConnectionsCard from "../feeds/SuggestedConnectionsCard";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import AboutCard from "../profile/AboutCard";
import ActivityCard from "../profile/ActivityCard";

export interface EntityProfileChildren {
  title: string;
  emptyMessage: string;
  items: EntityChildItem[];
}

export interface EntityProfileData {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  type?: BranchTypeEnum | null;
  createdAt?: string;
  affiliations: EntityAffiliation[];
  stats: EntityStat[];
  infoFields: EntityInfoField[];
  structuralPeriod: StructuralPeriodDetail | null;
  children: EntityProfileChildren | null;
  // The three most recent postings; the full history lives on the entity's own activities route.
  activities: ActivityEntry[];
}

interface EntityProfilePageProps {
  entity: EntityProfileData;
  // The session user as-is — every entity route renders the same chrome, so mapping it here keeps five routes from repeating it.
  viewer: SessionUser | null;
}

export default function EntityProfilePage({
  entity,
  viewer,
}: EntityProfilePageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer?.full_name}
        avatar={viewer?.avatar}
        userId={viewer?.id}
        username={viewer?.username}
        verificationStatus={viewer?.verification_status}
      />

      <PageMargin noMobilePadding className="pb-6 lg:py-6">
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
            <EntityProfileHeader
              name={entity.name}
              imageUrl={entity.imageUrl}
              type={entity.type}
              affiliations={entity.affiliations}
              createdAt={entity.createdAt}
              stats={entity.stats}
            />
            <AboutCard bio={entity.description ?? undefined} />
            <EntityInfoCard fields={entity.infoFields} />
            <EntityStructuralCard period={entity.structuralPeriod} />
            {entity.children && (
              <EntityChildrenCard
                title={entity.children.title}
                items={entity.children.items}
                emptyMessage={entity.children.emptyMessage}
              />
            )}
            <ActivityCard
              entries={entity.activities}
              seeAllHref={`${entityProfileHref(entity.entityType, entity.entityId)}/activities`}
              title="Postingan"
              emptyMessage="Belum ada postingan."
            />
          </div>

          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <SuggestedConnectionsCard title="Orang yang Mungkin Kamu Kenal" />
          </aside>
        </div>
      </PageMargin>

      <BottomNav userId={viewer?.id} username={viewer?.username} />
    </div>
  );
}
