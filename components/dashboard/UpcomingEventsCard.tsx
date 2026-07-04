import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { UPCOMING_EVENTS } from "./mockData";

export default function UpcomingEventsCard() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#172033]">
        <CalendarDays className="size-4 text-primary" />
        Event & Kalender
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {UPCOMING_EVENTS.map((event) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-[#dbe3ef] py-1">
              <span className="text-[10px] font-semibold uppercase text-secondary">
                {event.month}
              </span>
              <span className="text-base font-bold text-[#172033]">
                {event.day}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#172033]">
                {event.title}
              </p>
              <p className="text-xs text-[#5f6573]">{event.time}</p>
              <p className="flex items-center gap-1 text-xs text-[#5f6573]">
                <MapPin className="size-3" />
                <span className="truncate">{event.location}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <a
        href="#"
        className="mt-3 flex items-center justify-between border-t border-[#e6e9ef] pt-3 text-sm font-medium text-primary"
      >
        Lihat Semua Event
        <ChevronRight className="size-4" />
      </a>
    </div>
  );
}
