import type { EventAttendeePreview } from "@/apis/events";
import { formatEventAttendeeNames, formatEventAttendees } from "@/lib/event-ui";
import Avatar from "../common/Avatar";

const MAX_FACES = 5;

// Inherits its text color like the metadata above it; only the avatar ring depends on the surface.
export default function EventAttendeesSummary({
  viewer,
  attendees,
  count,
  isAttending,
  ended,
  onDark = false,
}: {
  viewer?: { id?: string; name?: string; avatar?: string | null };
  attendees: EventAttendeePreview[];
  count: number;
  isAttending: boolean;
  ended: boolean;
  onDark?: boolean;
}) {
  const viewerFace =
    isAttending && viewer?.id
      ? [{ id: viewer.id, name: viewer.name ?? "Kamu", avatar: viewer.avatar ?? undefined }]
      : [];
  const faces = [...viewerFace, ...attendees].slice(0, MAX_FACES);
  // The real count already includes the viewer; preview samples are the only faces added on top.
  const total = count + attendees.length;
  const hiddenFaces = Math.max(0, total - faces.length);
  const names = [...(viewerFace.length ? ["Kamu"] : []), ...attendees.map((person) => person.name)];
  const ringClass = onDark ? "ring-on-dark/70" : "ring-surface";

  return (
    <div className="flex items-center gap-3">
      {faces.length > 0 && (
        <div className="flex shrink-0 items-center">
          {faces.map((person, index) => (
            <span
              key={person.id}
              title={person.name}
              className={`rounded-full ring-2 ${ringClass} ${index > 0 ? "-ml-2" : ""}`}
            >
              <Avatar src={person.avatar} name={person.name} size={32} />
            </span>
          ))}
          {hiddenFaces > 0 && (
            <span
              className={`-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-surface-muted px-1 text-xs font-semibold tabular-nums text-muted-foreground ring-2 ${ringClass}`}
            >
              +{hiddenFaces}
            </span>
          )}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-5">{formatEventAttendees(total, ended)}</p>
        {names.length > 0 && (
          <p className="mt-0.5 break-words text-sm leading-5 opacity-80">
            {formatEventAttendeeNames(names, total, ended)}
          </p>
        )}
      </div>
    </div>
  );
}
