import type { ReactNode } from "react";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import { ActingEntityProvider } from "@/hooks/useActingEntity";
import { entityProfileHref } from "@/lib/feed-author";
import { withActingEntity } from "@/lib/access";
import OfficialBottomNav from "./OfficialBottomNav";
import OfficialGreetingBar from "./OfficialGreetingBar";

export default function OfficialPageShell({
  entity,
  compactGreeting = false,
  children,
}: {
  entity: ComposerAuthorEntity;
  compactGreeting?: boolean;
  children: ReactNode;
}) {
  const profileHref = withActingEntity(entityProfileHref(entity.type, entity.id), {
    entityType: entity.type,
    entityId: entity.id,
  });

  return (
    <ActingEntityProvider entity={entity}>
      <div className="min-h-screen bg-surface pb-16 lg:pb-0">
        <OfficialGreetingBar
          name={entity.name}
          imageUrl={entity.imageUrl}
          profileHref={profileHref}
          compact={compactGreeting}
        />
        {children}
        <OfficialBottomNav entityType={entity.type} entityId={entity.id} />
      </div>
    </ActingEntityProvider>
  );
}
