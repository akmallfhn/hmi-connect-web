import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import BottomNav from "../navigations/BottomNav";
import OfficialBottomNav from "./OfficialBottomNav";

// Entity-mode pages use the official tab bar for the selected cookie account.
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
