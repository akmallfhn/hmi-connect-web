import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);

export function localDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

export function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

// Same month → "17-29 Agu 2026"; same year → "31 Agu - 23 Sep 2026"; else → full dates both sides.
export function formatDateRange(startDate: string, endDate: string) {
  const start = dayjs(startDate).locale("id");
  const end = dayjs(endDate).locale("id");

  if (start.isSame(end, "day")) return start.format("D MMM YYYY");
  if (start.isSame(end, "month")) {
    return `${start.format("D")}-${end.format("D MMM YYYY")}`;
  }
  if (start.isSame(end, "year")) {
    return `${start.format("D MMM")} - ${end.format("D MMM YYYY")}`;
  }
  return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`;
}

// Long-form relative phrase ("5 menit yang lalu") — feed/comment/notification timestamps.
export function formatRelativeTime(dateString: string): string {
  return dayjs(dateString).locale("id").fromNow();
}

// Instagram-style short relative time — formatRelativeTime's "fromNow" is too long for a list row.
export function formatCompactTime(dateString: string): string {
  const date = dayjs(dateString);
  const now = dayjs();

  const minutes = now.diff(date, "minute");
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}mnt`;

  const hours = now.diff(date, "hour");
  if (hours < 24) return `${hours}j`;

  const days = now.diff(date, "day");
  if (days < 7) return `${days}h`;

  const weeks = now.diff(date, "week");
  if (weeks < 5) return `${weeks}mgg`;

  const months = now.diff(date, "month");
  return `${months}bln`;
}
