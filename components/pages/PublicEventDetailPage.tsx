import type { EventAttendeePreview, EventDetail } from "@/apis/events";
import type { SessionUser } from "@/apis/session";
import EventDetailContent from "../events/EventDetailContent";
import EventPageShell from "../events/EventPageShell";

export default function PublicEventDetailPage({
  viewer,
  event,
  attendees,
}: {
  viewer: SessionUser;
  event: EventDetail;
  attendees: EventAttendeePreview[];
}) {
  return (
    <EventPageShell viewer={viewer} mobileBackTitle="Detail Event">
      <EventDetailContent
        event={event}
        attendees={attendees}
        viewer={{ id: viewer.id, name: viewer.full_name, avatar: viewer.avatar }}
      />
    </EventPageShell>
  );
}
