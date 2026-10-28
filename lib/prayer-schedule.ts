import type { PrayerTimeKey, PrayerWidget } from "@/apis/prayer-schedules";
import {
  BROWSER_TIMEZONE_COOKIE_NAME,
  PRAYER_CITY_COOKIE_NAME,
} from "./constants";

export const PRAYER_TIME_ORDER: PrayerTimeKey[] = [
  "imsak",
  "subuh",
  "terbit",
  "dhuha",
  "zuhur",
  "asar",
  "magrib",
  "isya",
];

export const PRAYER_TIME_LABEL: Record<PrayerTimeKey, string> = {
  imsak: "Imsak",
  subuh: "Subuh",
  terbit: "Terbit",
  dhuha: "Dhuha",
  zuhur: "Dzuhur",
  asar: "Ashar",
  magrib: "Maghrib",
  isya: "Isya",
};

// The widget names its next prayer in the backend's own spelling ("Zuhur", "Asar", "Magrib").
const NEXT_PRAYER_KEY: Record<string, PrayerTimeKey> = {
  subuh: "subuh",
  zuhur: "zuhur",
  asar: "asar",
  magrib: "magrib",
  isya: "isya",
};

export function nextPrayerKey(name: string): PrayerTimeKey | null {
  return NEXT_PRAYER_KEY[name.trim().toLowerCase()] ?? null;
}

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function monthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? ""} ${year}`;
}

// "HH:mm" or "HH:mm:ss" → seconds since midnight.
export function timeToSeconds(value: string): number {
  const [hours = 0, minutes = 0, seconds = 0] = value.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Date-only strings are pinned to UTC so the weekday never shifts with the viewer's own zone.
export function formatScheduleDate(
  date: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("id-ID", { ...options, timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`)
  );
}

export function prayerSchedulesHref(params: {
  cityId?: number | null;
  month?: number;
  year?: number;
}): string {
  const search = new URLSearchParams();
  if (params.cityId) search.set("city_id", String(params.cityId));
  if (params.month && params.year) {
    search.set("month", String(params.month));
    search.set("year", String(params.year));
  }
  const query = search.toString();
  return query ? `/prayer-schedules?${query}` : "/prayer-schedules";
}

// Remount key for PrayerWidget, so fresh server data restarts the countdown from its new remaining seconds.
export function prayerWidgetKey(
  widget: PrayerWidget | null,
  cityId: number | null
): string {
  return widget
    ? `${widget.city_id}-${widget.date}-${widget.next_prayer_date}-${widget.next_prayer_time}`
    : `empty-${cityId}`;
}

export function rememberPrayerCity(cityId: number) {
  document.cookie = `${PRAYER_CITY_COOKIE_NAME}=${cityId}; path=/; max-age=31536000; samesite=lax`;
}

export const DEFAULT_PRAYER_FALLBACK_CITY = "Jakarta Pusat";

// One representative city per Indonesian zone, keyed by the browser's IANA time zone.
const TIMEZONE_FALLBACK_CITY: Record<string, string> = {
  "Asia/Jakarta": DEFAULT_PRAYER_FALLBACK_CITY,
  "Asia/Pontianak": DEFAULT_PRAYER_FALLBACK_CITY,
  "Asia/Makassar": "Kota Makassar",
  "Asia/Jayapura": "Kota Ambon",
};

export function prayerFallbackCityName(timezone?: string | null): string {
  return (timezone && TIMEZONE_FALLBACK_CITY[timezone]) || DEFAULT_PRAYER_FALLBACK_CITY;
}

// Writes the browser's zone into its cookie and returns it, or null when the stored value already matched.
export function syncBrowserTimezoneCookie(): string | null {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!timezone) return null;

  const prefix = `${BROWSER_TIMEZONE_COOKIE_NAME}=`;
  const stored = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length);
  if (stored && decodeURIComponent(stored) === timezone) return null;

  document.cookie = `${prefix}${encodeURIComponent(timezone)}; path=/; max-age=31536000; samesite=lax`;
  return timezone;
}
