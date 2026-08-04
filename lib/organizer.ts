import type { TrainingOrganizerTypeEnum } from "@/lib/types";

// Shared display format for the polymorphic chapter/branch/coordinating_body/organization organizer pattern.
export function formatOrganizerName(entity: {
  organizer_type: TrainingOrganizerTypeEnum;
  organizer_name?: string;
}) {
  const name = entity.organizer_name ?? "HMI";
  switch (entity.organizer_type) {
    case "coordinating_body":
      return `HMI Badko ${name}`;
    case "branch":
      return `HMI Cabang ${name}`;
    case "organization":
      return `Pengurus Besar ${name}`;
    case "chapter":
      return `HMI ${name}`;
    default:
      return name;
  }
}
