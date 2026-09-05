import type { SuspendedEntities, TrainingPriorities } from "@/apis/stat";
import SuspendedEntityList from "./SuspendedEntityList";
import TrainingPriorityList from "./TrainingPriorityList";

interface MasterAttentionListsProps {
  // Absent on /master, which reads these unscoped as Super Admin.
  organizationId?: string;
  trainingPriorities: TrainingPriorities | null;
  suspendedBranches: SuspendedEntities | null;
  suspendedCoordinatingBodies: SuspendedEntities | null;
}

export default function MasterAttentionLists({
  organizationId,
  trainingPriorities,
  suspendedBranches,
  suspendedCoordinatingBodies,
}: MasterAttentionListsProps) {
  return (
    <section aria-labelledby="master-attention-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="master-attention-title"
            className="text-base font-bold text-[#172033]"
          >
            Data yang Perlu Perhatian
          </h2>
          <p className="mt-0.5 text-xs text-[#5f6573]">
            Ringkasan entitas yang membutuhkan pemantauan dan tindak lanjut
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TrainingPriorityList
          entity="branch"
          organizationId={organizationId}
          initialData={trainingPriorities}
        />
        <SuspendedEntityList
          organizationId={organizationId}
          tabs={[
            {
              entityType: "branch",
              label: "Cabang",
              initialData: suspendedBranches,
            },
            {
              entityType: "coordinating_body",
              label: "Badko",
              initialData: suspendedCoordinatingBodies,
            },
          ]}
        />
      </div>
    </section>
  );
}
