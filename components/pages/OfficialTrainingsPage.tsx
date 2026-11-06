import { IconPlus } from "@tabler/icons-react";
import type { PagedTrainingResult, TrainingListEntry } from "@/apis/trainings";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import { MANAGE_TRAININGS_HREF } from "@/lib/access";
import { allowedTrainingLevels } from "@/lib/training-levels";
import PageMargin from "../common/PageMargin";
import Pagination from "../common/Pagination";
import EventLinkButton from "../events/EventLinkButton";
import EventListControls from "../events/EventListControls";
import OfficialPageShell from "../official/OfficialPageShell";
import EmptyState from "../states/EmptyState";
import PublicTrainingCard from "../trainings/PublicTrainingCard";
import TrainingSaveToast from "../trainings/TrainingSaveToast";

export default function OfficialTrainingsPage({ entity, result, initialSearch, saved }: {
  entity: ComposerAuthorEntity;
  result: PagedTrainingResult<TrainingListEntry>;
  initialSearch: string;
  saved?: "created" | "updated";
}) {
  const createHref = `${MANAGE_TRAININGS_HREF}/create`;
  const canCreate = allowedTrainingLevels(entity.type, entity.bodyType, entity.parentType).length > 0;
  return (
    <OfficialPageShell entity={entity} compactGreeting>
      <TrainingSaveToast kind={saved} />
      <PageMargin className="pt-4 lg:pt-6">
        <main className="flex flex-col gap-4 pb-6 lg:gap-6 lg:pb-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">Kelola Training</h1>
            {canCreate && <EventLinkButton href={createHref}><IconPlus className="size-4.5" stroke={2.4} />Buat training</EventLinkButton>}
          </div>
          <EventListControls basePath={MANAGE_TRAININGS_HREF} initialSearch={initialSearch} noun="training" />
          {result.list.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface">
              <EmptyState
                title={initialSearch ? "Training tidak ditemukan" : "Belum ada training"}
                description={initialSearch ? "Coba kata kunci lain atau hapus pencarian." : canCreate ? `Buat training atas nama ${entity.name}.` : "Akun ini belum memiliki training."}
                action={!initialSearch && canCreate ? <EventLinkButton href={createHref}><IconPlus className="size-4.5" stroke={2.4} />Buat training</EventLinkButton> : undefined}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
              {result.list.map((training) => <PublicTrainingCard key={training.id} training={training} isSignedIn manage />)}
            </div>
          )}
          {result.totalPage > 1 && <Pagination currentPage={result.currentPage} totalPages={result.totalPage} />}
        </main>
      </PageMargin>
    </OfficialPageShell>
  );
}
