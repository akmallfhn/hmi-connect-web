import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import {
  getTrainingDetail,
  listTrainingMaterials,
  listTrainingParticipants,
} from "@/apis/trainings";
import BranchLk2DetailPage, {
  type TrainingDetailTab,
} from "@/components/pages/BranchLk2DetailPage";

export const metadata: Metadata = {
  title: "Detail Latihan Kader 2",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface BranchLk2DetailRouteProps {
  params: Promise<{ branch_id: string; training_id: string }>;
  searchParams: Promise<{
    tab?: string;
    material_search?: string;
    material_page?: string;
    participant_search?: string;
    participant_page?: string;
  }>;
}

function parseTab(value?: string): TrainingDetailTab {
  if (value === "materi" || value === "peserta") return value;
  return "ringkasan";
}

function parsePage(value?: string) {
  return Math.max(1, Number(value ?? "1") || 1);
}

export default async function BranchLk2DetailRoute({
  params,
  searchParams,
}: BranchLk2DetailRouteProps) {
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
  const [materials, participants, { user }] = await Promise.all([
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
    getSession(),
  ]);
  const canManageTrainings =
    user?.role_name === "Super Admin" || user?.role_name === "Administrator";

  return (
    <BranchLk2DetailPage
      branchId={branch_id}
      training={training}
      materials={materials}
      participants={participants}
      initialTab={parseTab(query.tab)}
      initialMaterialSearch={materialSearch}
      initialParticipantSearch={participantSearch}
      pageSize={PAGE_SIZE}
      canManageTrainings={canManageTrainings}
    />
  );
}
