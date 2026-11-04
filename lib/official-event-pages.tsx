import "server-only";

import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import {
  getEventDetail,
  listEventAttendeePreview,
  listEventsByTimeframe,
} from "@/apis/events";
import OfficialEventDetailPage from "@/components/pages/OfficialEventDetailPage";
import OfficialEventFormPage from "@/components/pages/OfficialEventFormPage";
import OfficialEventsPage from "@/components/pages/OfficialEventsPage";
import PageState from "@/components/states/PageState";
import { holdsGrantAtEntity } from "@/lib/access";
import { loadOfficialAccountEntity } from "@/lib/official-account";
import type { AccessEntityTypeEnum } from "@/lib/types";

const PAGE_SIZE = 12;

// Same gate as the official timeline: checked before any fetch, so a wrong id confirms nothing.
async function loadContext(type: AccessEntityTypeEnum, id: string) {
  const { user } = await getSession();
  if (!holdsGrantAtEntity(user, type, id)) return { forbidden: true as const };
  const entity = await loadOfficialAccountEntity(type, id);
  if (!entity) notFound();
  return { forbidden: false as const, entity };
}

export async function renderOfficialEvents(
  type: AccessEntityTypeEnum,
  id: string,
  query: { search?: string; page?: string; tab?: string },
) {
  const context = await loadContext(type, id);
  if (context.forbidden) return <PageState variant="forbidden" />;
  const search = query.search?.trim() ?? "";
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const timeframe = query.tab === "past" ? "past" : "upcoming";
  const result = await listEventsByTimeframe({
    search: search || undefined,
    entityType: type,
    entityId: id,
    timeframe,
    page,
    pageSize: PAGE_SIZE,
  });
  return (
    <OfficialEventsPage
      entity={context.entity}
      result={result}
      timeframe={timeframe}
      initialSearch={search}
    />
  );
}

export async function renderOfficialEventCreate(
  type: AccessEntityTypeEnum,
  id: string,
) {
  const context = await loadContext(type, id);
  if (context.forbidden) return <PageState variant="forbidden" />;
  return <OfficialEventFormPage entity={context.entity} />;
}

async function loadOwnedEvent(
  type: AccessEntityTypeEnum,
  id: string,
  eventId: string,
) {
  const context = await loadContext(type, id);
  if (context.forbidden) return context;
  const event = await getEventDetail(eventId);
  if (!event || event.entity_type !== type || event.entity_id !== id) notFound();
  return { ...context, event };
}

export async function renderOfficialEventDetail(
  type: AccessEntityTypeEnum,
  id: string,
  eventId: string,
) {
  const context = await loadOwnedEvent(type, id, eventId);
  if (context.forbidden) return <PageState variant="forbidden" />;
  return (
    <OfficialEventDetailPage
      entity={context.entity}
      event={context.event}
      attendees={listEventAttendeePreview()}
    />
  );
}

export async function renderOfficialEventEdit(
  type: AccessEntityTypeEnum,
  id: string,
  eventId: string,
) {
  const context = await loadOwnedEvent(type, id, eventId);
  if (context.forbidden) return <PageState variant="forbidden" />;
  return <OfficialEventFormPage entity={context.entity} event={context.event} />;
}
