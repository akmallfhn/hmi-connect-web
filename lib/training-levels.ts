import type { AccessEntityTypeEnum, SpecialBodyTypeEnum, TrainingOrganizerTypeEnum, TrainingStatusEnum } from "@/lib/types";

export const TRAINING_LEVEL_LABEL: Record<TrainingStatusEnum, string> = {
  LK1: "Latihan Kader 1 (LK1)",
  LK2: "Latihan Kader 2 (LK2)",
  LK3: "Latihan Kader 3 (LK3)",
  SC: "Senior Course (SC)",
  LKK: "Latihan Khusus Kohati (LKK)",
  LKSG: "Latihan Kepemimpinan dan Sensitivitas Gender (LKSG)",
};

export function allowedTrainingLevels(
  type: TrainingOrganizerTypeEnum,
  bodyType?: SpecialBodyTypeEnum,
  parentType?: AccessEntityTypeEnum,
): TrainingStatusEnum[] {
  if (type === "chapter") return ["LK1"];
  if (type === "coordinating_chapter") return ["LK1", "LK2"];
  if (type === "branch") return ["LK2"];
  if (type === "coordinating_body" || type === "organization") return ["LK3"];
  if (type === "special_body") {
    return bodyType === "bpl" ? ["SC"] : bodyType === "kohati" && parentType === "branch" ? ["LKK", "LKSG"] : [];
  }
  return [];
}
