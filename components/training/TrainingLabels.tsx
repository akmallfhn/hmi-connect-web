import type { TrainingResultEnum } from "@/lib/types";
import Label from "../common/Label";
import {
  getTrainingDisplayStatus,
  type TrainingDisplayStatus,
} from "./trainingUi";

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
