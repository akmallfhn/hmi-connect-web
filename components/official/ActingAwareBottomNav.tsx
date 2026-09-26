import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import BottomNav from "../navigations/BottomNav";
import OfficialBottomNav from "./OfficialBottomNav";

// Pages that honor ?as= swap the personal tab bar for the entity's while they're viewed as it.
export default function ActingAwareBottomNav({
  actingEntity,
  userId,
  username,
}: {
  actingEntity?: ComposerAuthorEntity | null;
  userId?: string;
  username?: string;
}) {
  if (!actingEntity) return <BottomNav userId={userId} username={username} />;

  return (
    <OfficialBottomNav
      entityType={actingEntity.type}
      entityId={actingEntity.id}
    />
  );
}
