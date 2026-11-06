import type { TrainingOrganizerTypeEnum } from "@/lib/types";
import { formatEntityAuthorName } from "@/lib/feed-author";
import { formatSpecialBodyName } from "@/lib/special-body";

// Shared display format for all training organizer entity types.
export function formatOrganizerName(entity: {
  organizer_type: TrainingOrganizerTypeEnum | null;
  organizer_name?: string | null;
  level?: string | null;
}) {
  // Legacy records may lack a pair; show their stored name as-is.
  if (!entity.organizer_type) return entity.organizer_name || "Penyelenggara HMI";

  const name = entity.organizer_name || "HMI";
  if (entity.organizer_type === "special_body") {
    // Current training policy uniquely identifies the special body and its parent.
    if (entity.level === "SC") return formatSpecialBodyName("bpl", "organization", name);
    if (entity.level === "LKK" || entity.level === "LKSG") {
      return formatSpecialBodyName("kohati", "branch", name);
    }
    return name;
  }
  return formatEntityAuthorName(entity.organizer_type, name);
}
