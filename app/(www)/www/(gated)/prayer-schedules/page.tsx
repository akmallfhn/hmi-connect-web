import type { Metadata } from "next";
import PrayerSchedulePage from "@/components/pages/PrayerSchedulePage";
import { getSession } from "@/apis/session";
import {
  getPrayerWidget,
  listPrayerSchedules,
  resolvePrayerCityId,
} from "@/apis/prayer-schedules";

export const metadata: Metadata = {
  title: "Jadwal Sholat",
  description:
    "Jadwal sholat harian dan bulanan untuk kota pilihanmu, lengkap dengan hitung mundur waktu sholat berikutnya.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PrayerSchedulesProps {
  searchParams: Promise<{ city_id?: string; month?: string; year?: string }>;
}

function parsePositiveInt(value?: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function todayInJakarta(): { month: number; year: number } {
  const [year, month] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .split("-")
    .map(Number);
  return { month, year };
}

export default async function PrayerSchedules({
  searchParams,
}: PrayerSchedulesProps) {
  const params = await searchParams;
  const [{ user }, { cityId, isFallback }] = await Promise.all([
    getSession(),
    resolvePrayerCityId(params.city_id),
  ]);

  const requestedMonth = parsePositiveInt(params.month);
  const requestedYear = parsePositiveInt(params.year);
  const hasRequestedPeriod =
    requestedMonth !== null &&
    requestedMonth <= 12 &&
    requestedYear !== null &&
    requestedYear >= 2000 &&
    requestedYear <= 2100;
  const fallbackPeriod = todayInJakarta();
  let month = hasRequestedPeriod ? requestedMonth : fallbackPeriod.month;
  let year = hasRequestedPeriod ? requestedYear : fallbackPeriod.year;

  const [widget, initialSchedule] = cityId
    ? await Promise.all([
        getPrayerWidget(cityId),
        listPrayerSchedules({ cityId, month, year }),
      ])
    : [null, null];
  let schedule = initialSchedule;

  // Jakarta's month can differ from a WITA/WIT city's right around midnight, so trust the city's own date.
  if (cityId && widget && !hasRequestedPeriod) {
    const [widgetYear, widgetMonth] = widget.date.split("-").map(Number);
    if (widgetYear !== year || widgetMonth !== month) {
      month = widgetMonth;
      year = widgetYear;
      schedule = await listPrayerSchedules({ cityId, month, year });
    }
  }

  return (
    <PrayerSchedulePage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
      cityId={cityId}
      isFallbackCity={isFallback}
      widget={widget}
      schedule={schedule}
      month={month}
      year={year}
    />
  );
}
