import type { TrainingHistoryLevelEnum } from "./types";

export const TRAINING_HISTORY_LEVEL_OPTIONS: {
  label: string;
  value: TrainingHistoryLevelEnum;
}[] = [
  { label: "Latihan Kader 1 (LK1)", value: "LK1" },
  { label: "Latihan Kader 2 (LK2)", value: "LK2" },
  { label: "Latihan Kader 3 (LK3)", value: "LK3" },
  { label: "Senior Course (SC)", value: "SC" },
  { label: "Latihan Khusus Kohati (LKK)", value: "LKK" },
  { label: "Latihan Kader Sensitif Gender (LKSG)", value: "LKSG" },
];

export const TRAINING_HISTORY_LEVEL_LABELS: Record<
  TrainingHistoryLevelEnum,
  string
> = Object.fromEntries(
  TRAINING_HISTORY_LEVEL_OPTIONS.map(({ label, value }) => [value, label]),
) as Record<TrainingHistoryLevelEnum, string>;
