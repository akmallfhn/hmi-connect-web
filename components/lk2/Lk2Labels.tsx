import Label from "../common/Label";
import type { Lk2BatchStatus, Lk2ParticipantStatus } from "./mockData";

const BATCH_STATUS_TEXT: Record<Lk2BatchStatus, string> = {
  upcoming: "Akan Datang",
  ongoing: "Berlangsung",
  completed: "Selesai",
};

export function Lk2BatchStatusLabel({ status }: { status: Lk2BatchStatus }) {
  const variant = status === "completed" ? "green" : status === "ongoing" ? "blue" : "gray";
  return <Label variant={variant}>{BATCH_STATUS_TEXT[status]}</Label>;
}

const PARTICIPANT_STATUS_TEXT: Record<Lk2ParticipantStatus, string> = {
  passed: "Lulus",
  conditional_pass: "Lulus Bersyarat",
  failed: "Tidak Lulus",
  in_progress: "Sedang Mengikuti",
};

export function Lk2ParticipantStatusLabel({ status }: { status: Lk2ParticipantStatus }) {
  const variant =
    status === "passed"
      ? "green"
      : status === "conditional_pass"
        ? "yellow"
        : status === "failed"
          ? "red"
          : "gray";
  return <Label variant={variant}>{PARTICIPANT_STATUS_TEXT[status]}</Label>;
}
