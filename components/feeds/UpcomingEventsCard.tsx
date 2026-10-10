import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { UPCOMING_EVENTS } from "./mockData";

export default function UpcomingEventsCard() {
  return (
    <div className="border border-x-0 border-border bg-surface p-4 lg:rounded-2xl lg:border-x">
      <div className="flex items-center gap-2 text-sm font-semibold text-heading">
        <CalendarDays className="size-4 text-primary-foreground" />
        Event & Kalender
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {UPCOMING_EVENTS.map((event) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-border-strong py-1">
              <span className="text-[10px] font-semibold uppercase text-secondary-foreground">
                {event.month}
              </span>
              <span className="text-base font-bold text-heading">
                {event.day}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">
                {event.title}
              </p>
              <p className="text-xs text-muted-foreground">{event.time}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span className="truncate">{event.location}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <a
        href="#"
        className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium text-primary-foreground"
      >
        Lihat Semua Event
        <ChevronRight className="size-4" />
      </a>
    </div>
  );
}
