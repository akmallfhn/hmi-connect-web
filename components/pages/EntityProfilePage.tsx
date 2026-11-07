import type { SessionUser } from "@/apis/session";
import { entityMembersQueryKey, entityPostsQueryKey } from "@/lib/entity-profile";
import type { EntityProfileFeeds } from "@/lib/entity-profile-data";
import type {
  BranchTypeEnum,
  MentionEntityTypeEnum,
  SpecialBodyTypeEnum,
} from "@/lib/types";
import PageMargin from "../common/PageMargin";
import EntityChildrenCard, {
  type EntityChildItem,
} from "../entity/EntityChildrenCard";
import { EntityEventList, EntityTrainingList } from "../entity/EntityAgendaLists";
import EntityMemberGrid from "../entity/EntityMemberGrid";
import EntityPostTimeline from "../entity/EntityPostTimeline";
import EntityProfileHeader, {
  type EntityAffiliation,
  type EntityStat,
} from "../entity/EntityProfileHeader";
import EntitySections, { type EntitySection } from "../entity/EntitySections";
import SuggestedConnectionsCard from "../feeds/SuggestedConnectionsCard";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import ActingAwareBottomNav from "../official/ActingAwareBottomNav";
import { ActingEntityProvider } from "@/hooks/useActingEntity";
import Header from "../navigations/Header";
import AboutCard from "../profile/AboutCard";
import ServerQueryHydration from "../query/ServerQueryHydration";

export interface EntityProfileChildren {
  // Komisariat for a Cabang or Korkom, Cabang for a Badko or the organization.
  tab: "chapters" | "branches";
  title: string;
  items: EntityChildItem[];
}

export interface EntityProfileData {
  entityType: MentionEntityTypeEnum;
  specialBodyType?: SpecialBodyTypeEnum;
  affiliationLead?: string;
  entityId: string;
  name: string;
  mentionName: string;
  // The canonical lowercase-handle URL; tabs rewrite the URL in place, so they must keep it.
  profileHref: string;
  imageUrl: string | null;
  description: string | null;
  type?: BranchTypeEnum | null;
  parents: EntityAffiliation[];
  stats: EntityStat[];
  children: EntityProfileChildren | null;
  feeds: EntityProfileFeeds;
}

interface EntityProfilePageProps {
  entity: EntityProfileData;
  // The session user as-is — every entity route renders the same chrome, so mapping it here keeps five routes from repeating it.
  viewer: SessionUser | null;
  // Set by the validated active-account cookie: personal suggestions and following go.
  actingEntity?: ComposerAuthorEntity | null;
}

const CHILD_TAB_LABEL: Record<EntityProfileChildren["tab"], string> = {
  chapters: "Komisariat",
  branches: "Cabang",
};

export default function EntityProfilePage({
  entity,
  viewer,
  actingEntity,
}: EntityProfilePageProps) {
  const { posts, members, follow, events, trainings } = entity.feeds;
  const sections: EntitySection[] = [];

  if (posts.list.length > 0) {
    sections.push({
      value: "posts",
      label: "Post",
      panel: (
        <ServerQueryHydration
          queryKey={entityPostsQueryKey(entity.entityType, entity.entityId, viewer?.id)}
          data={{ pages: [posts], pageParams: [1] }}
        >
          <EntityPostTimeline
            entityType={entity.entityType}
            entityId={entity.entityId}
            initialItems={posts.list}
            initialHasMore={posts.hasMore}
            viewer={{
              id: viewer?.id,
              name: viewer?.full_name,
              avatar: viewer?.avatar,
              status: viewer?.status,
              verificationStatus: viewer?.verification_status,
            }}
            actingEntity={actingEntity}
          />
        </ServerQueryHydration>
      ),
    });
  }

  if (members.list.length > 0 && entity.entityType !== "special_body") {
    sections.push({
      value: "people",
      label: "People",
      panel: (
        <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
          <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
            {members.totalData.toLocaleString("id-ID")} kader terdaftar
          </h2>
          <div className="mt-4">
            <ServerQueryHydration
              queryKey={entityMembersQueryKey(entity.entityType, entity.entityId, viewer?.id)}
              data={{ pages: [members], pageParams: [1] }}
            >
              <EntityMemberGrid
                entityType={entity.entityType}
                entityId={entity.entityId}
                viewerId={viewer?.id}
                initialItems={members.list}
                initialHasMore={members.hasMore}
              />
            </ServerQueryHydration>
          </div>
        </section>
      ),
    });
  }

  if (entity.children && entity.children.items.length > 0) {
    sections.push({
      value: entity.children.tab,
      label: CHILD_TAB_LABEL[entity.children.tab],
      panel: (
        <EntityChildrenCard
          title={entity.children.title}
          items={entity.children.items}
        />
      ),
    });
  }

  if (events.list.length > 0) {
    sections.push({
      value: "events",
      label: "Event",
      panel: (
        <EntityEventList
          key={`${entity.entityType}:${entity.entityId}:events`}
          entityType={entity.entityType}
          entityId={entity.entityId}
          initialPage={events}
        />
      ),
    });
  }

  if (trainings.list.length > 0) {
    sections.push({
      value: "trainings",
      label: "Training",
      panel: (
        <EntityTrainingList
          key={`${entity.entityType}:${entity.entityId}:trainings`}
          entityType={entity.entityType}
          entityId={entity.entityId}
          initialPage={trainings}
          isSignedIn={Boolean(viewer?.id)}
        />
      ),
    });
  }

  return (
    <ActingEntityProvider entity={actingEntity ?? null}>
      <div className="min-h-screen bg-surface pb-16 lg:pb-0">
        <Header
          fullName={viewer?.full_name}
          avatar={viewer?.avatar}
          userId={viewer?.id}
          username={viewer?.username}
          verificationStatus={viewer?.verification_status}
        />

        <PageMargin noMobilePadding className="pb-6 lg:py-6">
          <div className="grid grid-cols-1 gap-1.5 lg:items-start lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
              <EntityProfileHeader
                entityType={entity.entityType}
                specialBodyType={entity.specialBodyType}
                affiliationLead={entity.affiliationLead}
                entityId={entity.entityId}
                name={entity.name}
                mentionName={entity.mentionName}
                imageUrl={entity.imageUrl}
                type={entity.type}
                parents={entity.parents}
                stats={entity.stats}
                // Following is personal, so it goes while browsing as an official account.
                follow={viewer?.id && !actingEntity ? follow : null}
              />
              <AboutCard bio={entity.description ?? undefined} />
              <EntitySections
                baseHref={entity.profileHref}
                sections={sections}
              />
            </div>

            <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
              {!actingEntity && <SuggestedConnectionsCard />}
            </aside>
          </div>
        </PageMargin>

        <ActingAwareBottomNav
          actingEntity={actingEntity}
          userId={viewer?.id}
          username={viewer?.username}
        />
      </div>
    </ActingEntityProvider>
  );
}
