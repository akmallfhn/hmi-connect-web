import { localDateKey } from "@/lib/time-manipulation";

export type TrainingDisplayStatus = "upcoming" | "ongoing" | "completed";

export function getTrainingDisplayStatus(
  startDate: string,
  endDate: string
): TrainingDisplayStatus {
  const today = localDateKey();
  if (today < startDate) return "upcoming";
  if (today > endDate) return "completed";
  return "ongoing";
}
