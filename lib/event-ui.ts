import { ADMIN_ENTITY_BASE_PATH } from "@/lib/access";
import {
  entityProfileHref,
  formatEntityAuthorName,
  type FeedAuthor,
} from "@/lib/feed-author";
import type { AccessEntityTypeEnum, EventEntityTypeEnum } from "@/lib/types";

const WIB = "Asia/Jakarta";
const WIB_OFFSET = "+07:00";
const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatWib(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: WIB, ...options }).format(date);
}

// en-CA formats as YYYY-MM-DD, which keys a calendar day in WIB regardless of the runtime's zone.
function wibDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function wibTime(date: Date) {
  return formatWib(date, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

export function formatEventDateLabel(startValue: string, endValue: string) {
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start || !end) return startValue;
  if (wibDayKey(start) === wibDayKey(end)) {
    return formatWib(start, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  const sameYear = wibDayKey(start).slice(0, 4) === wibDayKey(end).slice(0, 4);
  const startLabel = formatWib(start, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endLabel = formatWib(end, { day: "numeric", month: "short", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function formatEventTimeLabel(startValue: string, endValue: string) {
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start || !end) return "";
  return `${wibTime(start)}–${wibTime(end)} WIB`;
}

export function formatEventDuration(minutes: number) {
  if (!minutes || minutes <= 0) return null;
  if (minutes >= 24 * 60) return `${Math.ceil(minutes / (24 * 60))} hari`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours ? `${hours} jam` : "", rest ? `${rest} menit` : ""]
    .filter(Boolean)
    .join(" ");
}

export function formatEventDateTile(value: string) {
  const date = parseDate(value);
  if (!date) return { day: "-", month: "-" };
  return {
    day: formatWib(date, { day: "numeric" }),
    month: formatWib(date, { month: "short" }).toUpperCase(),
  };
}

export type EventStatusTone = "live" | "soon" | "upcoming" | "ended";

export function eventStatus(
  startValue: string,
  endValue: string,
  now: Date = new Date(),
): { label: string; tone: EventStatusTone } {
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start || !end) return { label: "Akan datang", tone: "upcoming" };
  if (now > end) return { label: "Selesai", tone: "ended" };
  if (now >= start) return { label: "Sedang berlangsung", tone: "live" };
  const days =
    (Date.parse(`${wibDayKey(start)}T00:00:00Z`) -
      Date.parse(`${wibDayKey(now)}T00:00:00Z`)) /
    DAY_MS;
  if (days === 0) return { label: "Hari ini", tone: "soon" };
  if (days === 1) return { label: "Besok", tone: "soon" };
  return { label: "Akan datang", tone: "upcoming" };
}

export function isEventEnded(endValue: string, now: Date = new Date()) {
  const end = parseDate(endValue);
  return end ? now > end : false;
}

function isAccessEntityType(type: EventEntityTypeEnum): type is AccessEntityTypeEnum {
  return type in ADMIN_ENTITY_BASE_PATH;
}

// Special bodies have no id-keyed profile route, so only the five hierarchy levels get a link.
export function eventOrganizer(event: {
  entity_type: EventEntityTypeEnum;
  entity_id: string;
  entity_name: string;
  entity_image_url?: string | null;
}): { author: FeedAuthor; href: string | null } {
  const accessType = isAccessEntityType(event.entity_type) ? event.entity_type : null;
  const href = accessType ? entityProfileHref(accessType, event.entity_id) : null;
  return {
    href,
    author: {
      name: accessType
        ? formatEntityAuthorName(accessType, event.entity_name)
        : event.entity_name,
      avatar: event.entity_image_url ?? undefined,
      href: href ?? "#",
      isEntity: true,
    },
  };
}

export function eventShareText(title: string, startValue: string, endValue: string) {
  return `Yuk ikut ${title} (${formatEventDateLabel(startValue, endValue)}) di HMI Connect`;
}

// The backend stores these as free text, so a javascript: value must never reach an href.
export function safeExternalUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// Only Google's own embed path may become an iframe src.
export function googleMapsEmbedUrl(value?: string | null): string | null {
  const safe = safeExternalUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  return url.protocol === "https:" &&
    url.hostname === "www.google.com" &&
    url.pathname.startsWith("/maps/embed")
    ? safe
    : null;
}

export function googleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// A stored embed wins; otherwise the location text drives Google's keyless embed, with "!" escaped as pb's delimiter.
export function eventMapEmbedUrl(
  locationUrl?: string | null,
  locationName?: string | null,
): string | null {
  const stored = googleMapsEmbedUrl(locationUrl);
  if (stored) return stored;
  const query = locationName?.trim();
  if (!query) return null;
  const encoded = encodeURIComponent(query).replace(/!/g, "%21");
  return `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s${encoded}`;
}

// A stored non-embed link is the organizer's own directions; embeds aren't meant to open as a page.
export function eventDirectionsUrl(
  locationUrl?: string | null,
  locationName?: string | null,
): string | null {
  const stored = safeExternalUrl(locationUrl);
  if (stored && !googleMapsEmbedUrl(stored)) return stored;
  return locationName?.trim() ? googleMapsSearchUrl(locationName.trim()) : null;
}

// "Monas, Jl. Silang Merdeka, Jakarta" reads as a place name over its address.
export function splitEventLocation(locationName?: string | null) {
  const value = locationName?.trim() ?? "";
  const comma = value.indexOf(",");
  if (comma < 0) return { place: value, address: "" };
  return { place: value.slice(0, comma).trim(), address: value.slice(comma + 1).trim() };
}

export function formatEventAttendeeNames(
  names: string[],
  total: number,
): string {
  const shown = names.slice(0, 2);
  const others = Math.max(0, total - shown.length);
  if (shown.length === 0) return "";
  if (others > 0) {
    return `${shown.join(", ")}${shown.length > 1 ? "," : ""} dan ${others} lainnya`;
  }
  return shown.join(" dan ");
}

// The form edits wall-clock WIB, so server and browser render the same value whatever their zone.
export function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = parseDate(value);
  if (!date) return "";
  const time = wibTime(date).replace(".", ":");
  return `${wibDayKey(date)}T${time}`;
}

export function dateTimeLocalToIso(value: string) {
  return `${value}:00${WIB_OFFSET}`;
}

// Treating the value as UTC keeps the arithmetic free of the browser's own zone.
export function addHoursToDateTimeLocal(value: string, hours: number) {
  const date = parseDate(`${value}:00Z`);
  if (!date) return "";
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString().slice(0, 16);
}
