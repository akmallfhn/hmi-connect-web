import type { EventDetail } from "@/apis/events";
import type { SessionUser } from "@/apis/session";
import EventDetailContent from "../events/EventDetailContent";
import EventPageShell from "../events/EventPageShell";

export default function PublicEventDetailPage({
  viewer,
  event,
  canChat,
  organizerName,
}: {
  viewer: SessionUser;
  event: EventDetail;
  canChat: boolean;
  organizerName?: string;
}) {
  return (
    <EventPageShell viewer={viewer} mobileBackTitle="Detail Event">
      <EventDetailContent
        event={event}
        attendees={event.attendee_preview}
        canChat={canChat}
        organizerName={organizerName}
        viewer={{ id: viewer.id, name: viewer.full_name, avatar: viewer.avatar }}
      />
    </EventPageShell>
  );
}
