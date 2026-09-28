import type { TrainingOrganizerTypeEnum } from "@/lib/types";

// Shared display format for the polymorphic chapter/branch/coordinating_body/organization organizer pattern.
export function formatOrganizerName(entity: {
  organizer_type: TrainingOrganizerTypeEnum | null;
  organizer_name?: string | null;
}) {
  // Without the pair, organizer_name is the organizer's full free-text name, so it gets no prefix.
  if (!entity.organizer_type) return entity.organizer_name || "Penyelenggara HMI";

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
