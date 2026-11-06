import "server-only";

import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getTrainingDetail, listTrainings } from "@/apis/trainings";
import { selectedActingEntityRef } from "@/lib/acting-entity";
import { loadOfficialAccountEntity } from "@/lib/official-account";
import { allowedTrainingLevels } from "@/lib/training-levels";
import OfficialTrainingsPage from "./OfficialTrainingsPage";
import OfficialTrainingFormPage from "./OfficialTrainingFormPage";

async function loadContext() {
  const { user } = await getSession();
  const selected = await selectedActingEntityRef(user);
  if (!selected) notFound();
  const entity = await loadOfficialAccountEntity(selected.entityType, selected.entityId);
  if (!entity) notFound();
  return entity;
}

export async function renderOfficialTrainings(query: { search?: string; page?: string; saved?: string }) {
  const entity = await loadContext();
  const search = query.search?.trim() ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const result = await listTrainings({
    search: search || undefined,
    organizerType: entity.type,
    organizerId: entity.id,
    page,
    pageSize: 12,
  });
  return <OfficialTrainingsPage entity={entity} result={result} initialSearch={search}
    saved={query.saved === "created" || query.saved === "updated" ? query.saved : undefined} />;
}

export async function renderOfficialTrainingCreate() {
  const entity = await loadContext();
  if (allowedTrainingLevels(entity.type, entity.bodyType, entity.parentType).length === 0) notFound();
  return <OfficialTrainingFormPage entity={entity} />;
}

export async function renderOfficialTrainingEdit(trainingId: string) {
  const entity = await loadContext();
  const training = await getTrainingDetail(trainingId);
  if (!training || training.organizer_type !== entity.type || training.organizer_id !== entity.id) notFound();
  return <OfficialTrainingFormPage entity={entity} training={training} />;
}
