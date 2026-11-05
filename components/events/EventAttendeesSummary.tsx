import type { EventAttendeePreview } from "@/apis/events";
import { formatEventAttendeeNames } from "@/lib/event-ui";
import Avatar from "../common/Avatar";

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
  const withoutViewer = attendees.filter((person) => person.id !== viewer?.id);
  const viewerPreview = attendees.find((person) => person.id === viewer?.id);
  const viewerFace = isAttending && viewer?.id
    ? [{ id: viewer.id, name: viewer.name ?? viewerPreview?.name ?? "Kamu", avatar: viewer.avatar ?? viewerPreview?.avatar }]
    : [];
  const faces = [...viewerFace, ...withoutViewer].slice(0, Math.min(2, count));
  const hiddenFaces = Math.max(0, count - faces.length);
  const names = faces.map((person) => person.id === viewer?.id ? "Kamu" : person.name);
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
        <p className="text-[15px] font-semibold leading-5">
          {count} orang {ended ? "telah menghadiri" : "akan menghadiri"} event ini.
        </p>
        {names.length > 0 && (
          <p className="mt-0.5 break-words text-sm leading-5 opacity-80">
            {formatEventAttendeeNames(names, count)}
          </p>
        )}
      </div>
    </div>
  );
}
