import type {
  TrainingResultEnum,
  TrainingStatusEnum,
} from "@/lib/types";
import Label from "../common/Label";
import {
  getTrainingDisplayStatus,
  type TrainingDisplayStatus,
} from "@/lib/trainings/training-ui";

const STATUS_CONTENT: Record<
  TrainingDisplayStatus,
  { label: string; variant: "blue" | "green" | "gray" }
> = {
  upcoming: { label: "Akan Datang", variant: "blue" },
  ongoing: { label: "Berlangsung", variant: "green" },
  completed: { label: "Selesai", variant: "gray" },
};

export function TrainingStatusLabel({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const content = STATUS_CONTENT[getTrainingDisplayStatus(startDate, endDate)];
  return <Label variant={content.variant}>{content.label}</Label>;
}

const LEVEL_VARIANTS: Record<
  TrainingStatusEnum,
  "green" | "orange" | "purple"
> = {
  LK1: "green",
  LK2: "orange",
  LK3: "purple",
};

export function TrainingLevelLabel({ level }: { level: TrainingStatusEnum }) {
  return <Label variant={LEVEL_VARIANTS[level]}>{level}</Label>;
}

const RESULT_CONTENT: Record<
  TrainingResultEnum,
  { label: string; variant: "green" | "yellow" | "red" }
> = {
  passed: { label: "Lulus", variant: "green" },
  conditional_pass: { label: "Lulus Bersyarat", variant: "yellow" },
  failed: { label: "Tidak Lulus", variant: "red" },
};

export function TrainingResultLabel({ result }: { result?: TrainingResultEnum }) {
  if (!result) return <Label variant="gray">Belum Dinilai</Label>;
  const content = RESULT_CONTENT[result];
  return <Label variant={content.variant}>{content.label}</Label>;
}
