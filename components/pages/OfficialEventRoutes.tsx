import "server-only";

import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import {
  getEventDetail,
  listEventCategories,
  listEventsChronological,
} from "@/apis/events";
import OfficialEventFormPage from "@/components/pages/OfficialEventFormPage";
import OfficialEventsPage from "@/components/pages/OfficialEventsPage";
import { selectedActingEntityRef } from "@/lib/acting-entity";
import { loadOfficialAccountEntity } from "@/lib/official-account";

const PAGE_SIZE = 12;

// User mode has no event-management surface. The selected cookie is rechecked against grants.
async function loadContext() {
  const { user } = await getSession();
  const selected = await selectedActingEntityRef(user);
  if (!selected) notFound();
  const entity = await loadOfficialAccountEntity(selected.entityType, selected.entityId);
  if (!entity) notFound();
  return { entity };
}

export async function renderOfficialEvents(
  query: { search?: string; page?: string; saved?: string },
) {
  const context = await loadContext();
  const search = query.search?.trim() ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const result = await listEventsChronological({
    search: search || undefined,
    entityType: context.entity.type,
    entityId: context.entity.id,
    page,
    pageSize: PAGE_SIZE,
  });
  return (
    <OfficialEventsPage
      entity={context.entity}
      result={result}
      initialSearch={search}
      saved={query.saved === "created" || query.saved === "updated" ? query.saved : undefined}
    />
  );
}

export async function renderOfficialEventCreate() {
  const context = await loadContext();
  const categories = await listEventCategories();
  return <OfficialEventFormPage entity={context.entity} categories={categories} />;
}

async function loadOwnedEvent(eventId: string) {
  const context = await loadContext();
  const event = await getEventDetail(eventId);
  if (
    !event ||
    event.entity_type !== context.entity.type ||
    event.entity_id !== context.entity.id
  ) notFound();
  return { ...context, event };
}

export async function renderOfficialEventEdit(eventId: string) {
  const context = await loadOwnedEvent(eventId);
  const categories = await listEventCategories();
  return <OfficialEventFormPage entity={context.entity} event={context.event} categories={categories} />;
}
