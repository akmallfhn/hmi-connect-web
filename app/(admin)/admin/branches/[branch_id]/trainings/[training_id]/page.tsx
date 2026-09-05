import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { canManageEntity } from "@/lib/access";
import {
  getTrainingDetail,
  listTrainingEvaluations,
  listTrainingMaterials,
  listTrainingParticipants,
} from "@/apis/trainings";
import BranchTrainingDetailPage, {
  type TrainingDetailTab,
} from "@/components/pages/BranchTrainingDetailPage";

export const metadata: Metadata = {
  title: "Detail Latihan Kader 2",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface BranchTrainingDetailRouteProps {
  params: Promise<{ branch_id: string; training_id: string }>;
  searchParams: Promise<{
    tab?: string;
    material_search?: string;
    material_page?: string;
    participant_search?: string;
    participant_page?: string;
    evaluation_search?: string;
    evaluation_page?: string;
  }>;
}

function parseTab(value?: string): TrainingDetailTab {
  if (value === "materi" || value === "peserta" || value === "penilaian") {
    return value;
  }
  return "ringkasan";
}

function parsePage(value?: string) {
  return Math.max(1, Number(value ?? "1") || 1);
}

export default async function BranchTrainingDetailRoute({
  params,
  searchParams,
}: BranchTrainingDetailRouteProps) {
  const [{ branch_id, training_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const training = await getTrainingDetail(training_id);

  if (
    !training ||
    training.level !== "LK2" ||
    training.organizer_type !== "branch" ||
    training.organizer_id !== branch_id
  ) {
    notFound();
  }

  const materialSearch = query.material_search?.trim() ?? "";
  const participantSearch = query.participant_search?.trim() ?? "";
  const evaluationSearch = query.evaluation_search?.trim() ?? "";
  const [materials, participants, evaluationMatrix, { user }] =
    await Promise.all([
      listTrainingMaterials(training.id, {
        search: materialSearch || undefined,
        page: parsePage(query.material_page),
        pageSize: PAGE_SIZE,
      }),
      listTrainingParticipants(training.id, {
        search: participantSearch || undefined,
        page: parsePage(query.participant_page),
        pageSize: PAGE_SIZE,
      }),
      listTrainingEvaluations(training.id, {
        search: evaluationSearch || undefined,
        page: parsePage(query.evaluation_page),
        pageSize: PAGE_SIZE,
      }),
      getSession(),
    ]);
  // Writes need a manage grant on the training's own organizer — this route is always branch-organized.
  const canManageTrainings = canManageEntity(user, "branch", branch_id);
  const canManageEvaluations =
    canManageTrainings || user?.id === training.contact_person_id;

  return (
    <BranchTrainingDetailPage
      branchId={branch_id}
      training={training}
      materials={materials}
      participants={participants}
      evaluationMatrix={evaluationMatrix}
      initialTab={parseTab(query.tab)}
      initialMaterialSearch={materialSearch}
      initialParticipantSearch={participantSearch}
      initialEvaluationSearch={evaluationSearch}
      pageSize={PAGE_SIZE}
      canManageTrainings={canManageTrainings}
      canManageEvaluations={canManageEvaluations}
    />
  );
}
