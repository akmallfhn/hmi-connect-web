import type { EventAttendeePreview, EventDetail } from "@/apis/events";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import { officialEntityEventsHref } from "@/lib/access";
import EventDetailContent from "../events/EventDetailContent";
import OfficialPageShell from "../official/OfficialPageShell";

export default function OfficialEventDetailPage({
  entity,
  event,
  attendees,
}: {
  entity: ComposerAuthorEntity;
  event: EventDetail;
  attendees: EventAttendeePreview[];
}) {
  const baseHref = officialEntityEventsHref(entity.type, entity.id);
  return (
    <OfficialPageShell entity={entity} compactGreeting>
      <EventDetailContent
        event={event}
        attendees={attendees}
        manage
        editHref={`${baseHref}/${event.id}/edit`}
        afterDeleteHref={baseHref}
      />
    </OfficialPageShell>
  );
}
