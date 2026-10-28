"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { PrayerMonthSchedule } from "@/apis/prayer-schedules";
import {
  PRAYER_TIME_LABEL,
  PRAYER_TIME_ORDER,
  formatScheduleDate,
  monthLabel,
  prayerSchedulesHref,
} from "@/lib/prayer-schedule";
import Button from "../buttons/Button";
import EmptyState from "../states/EmptyState";

interface PrayerMonthTableProps {
  cityId: number | null;
  cityName?: string;
  schedule: PrayerMonthSchedule | null;
  month: number;
  year: number;
  // The city's own "today" (YYYY-MM-DD), highlighted when it falls in this month.
  today?: string;
}

function shiftMonth(month: number, year: number, delta: number) {
  const index = year * 12 + (month - 1) + delta;
  return { month: (index % 12) + 1, year: Math.floor(index / 12) };
}

export default function PrayerMonthTable({
  cityId,
  cityName,
  schedule,
  month,
  year,
  today,
}: PrayerMonthTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function goToMonth(delta: number) {
    const target = shiftMonth(month, year, delta);
    startTransition(() => {
      router.push(prayerSchedulesHref({ cityId, ...target }), { scroll: false });
    });
  }

  const label = monthLabel(month, year);
  const place = schedule?.city_name ?? cityName;
  const previousDisabled = pending || year * 12 + month <= 2000 * 12 + 1;
  const nextDisabled = pending || year * 12 + month >= 2100 * 12 + 12;

  return (
    <section>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-4">
        <div className="min-w-0">
          <h2 className="font-stack-sans-headline text-lg font-medium text-heading lg:text-2xl">
            Jadwal Sholat Bulan {label}
          </h2>
          {place && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Untuk wilayah {place} dan sekitarnya
              {schedule && ` · ${schedule.timezone_abbr}`}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-1 sm:justify-start">
          <Button
            variant="ghost"
            size="icon"
            className="size-9!"
            aria-label="Bulan sebelumnya"
            disabled={previousDisabled}
            onClick={() => goToMonth(-1)}
          >
            <IconChevronLeft className="size-5" stroke={2} />
          </Button>
          <span className="min-w-32 text-center text-sm font-semibold text-heading tabular-nums">
            {label}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-9!"
            aria-label="Bulan berikutnya"
            disabled={nextDisabled}
            onClick={() => goToMonth(1)}
          >
            <IconChevronRight className="size-5" stroke={2} />
          </Button>
        </div>
      </div>

      <div
        aria-busy={pending}
        className={[
          "overflow-hidden rounded-2xl border border-border bg-surface transition-opacity",
          pending ? "opacity-60" : "",
        ].join(" ")}
      >
        {!schedule || schedule.list.length === 0 ? (
          <EmptyState
            title="Jadwal belum tersedia"
            description={
              cityId
                ? `Jadwal sholat ${place ?? "lokasi ini"} untuk ${label} belum tersedia.`
                : "Pilih kota terlebih dahulu untuk melihat jadwal sholat bulanan."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">
                Jadwal sholat {place} bulan {label}
              </caption>
              <thead>
                <tr className="bg-primary-soft text-primary-foreground">
                  <th
                    scope="col"
                    className="sticky left-0 z-20 bg-primary-soft px-4 py-3 text-left font-semibold"
                  >
                    Tanggal
                  </th>
                  {PRAYER_TIME_ORDER.map((key) => (
                    <th key={key} scope="col" className="px-3 py-3 text-center font-semibold">
                      {PRAYER_TIME_LABEL[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {schedule.list.map((day) => {
                  const isToday = day.date === today;
                  const weekday = formatScheduleDate(day.date, { weekday: "long" });
                  const isFriday = new Date(`${day.date}T00:00:00Z`).getUTCDay() === 5;
                  const rowBg = isToday ? "bg-secondary-soft" : "bg-surface";
                  return (
                    <tr
                      key={day.date}
                      aria-current={isToday ? "date" : undefined}
                      className={["tabular-nums", rowBg].join(" ")}
                    >
                      <th
                        scope="row"
                        className={[
                          "sticky left-0 z-10 px-4 py-2.5 text-left font-normal",
                          rowBg,
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={[
                              "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                              isToday
                                ? "bg-secondary text-on-secondary"
                                : "bg-surface-muted text-heading",
                            ].join(" ")}
                          >
                            {formatScheduleDate(day.date, { day: "2-digit" })}
                          </span>
                          <span
                            className={
                              isToday
                                ? "font-semibold text-heading"
                                : isFriday
                                  ? "text-primary-foreground"
                                  : "text-content-foreground"
                            }
                          >
                            {weekday}
                          </span>
                        </span>
                      </th>
                      {PRAYER_TIME_ORDER.map((key) => (
                        <td
                          key={key}
                          className={[
                            "px-3 py-2.5 text-center",
                            isToday ? "font-semibold text-heading" : "text-content-foreground",
                          ].join(" ")}
                        >
                          {day[key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
