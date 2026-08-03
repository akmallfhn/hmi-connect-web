export type TrainingDisplayStatus = "upcoming" | "ongoing" | "completed";

function localDateKey(date = new Date()) {
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

export function getTrainingDisplayStatus(
  startDate: string,
  endDate: string
): TrainingDisplayStatus {
  const today = localDateKey();
  if (today < startDate) return "upcoming";
  if (today > endDate) return "completed";
  return "ongoing";
}

export function formatTrainingDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function formatTrainingDateRange(startDate: string, endDate: string) {
  return `${formatTrainingDate(startDate)} - ${formatTrainingDate(endDate)}`;
}
