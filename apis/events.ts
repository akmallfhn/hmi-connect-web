import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isSuccessStatus, type EventEntityTypeEnum } from "@/lib/types";
import { callApi, type ApiEnvelope } from "./api";

export type EventContact = {
  id: string;
  name: string;
  phone_number?: string;
  user_id?: string;
  avatar?: string;
  position: number;
};

export type EventImage = {
  id: string;
  role: "cover" | "gallery";
  media_id: string;
  position: number;
  image_url?: string;
};

export type EventListEntry = {
  id: string;
  title: string;
  category_id: number;
  category_name: string;
  entity_type: EventEntityTypeEnum;
  entity_id: string;
  entity_name: string;
  entity_image_url?: string | null;
  start_date: string;
  end_date: string;
  duration_minutes: number;
  location_name?: string;
  thumbnail_media_id?: string;
  thumbnail_url?: string;
  attendee_count: number;
  is_attending: boolean;
  created_at: string;
};

export type EventDetail = EventListEntry & {
  description?: string;
  location_url?: string;
  link_url?: string;
  contacts: EventContact[];
  images: EventImage[];
  attendee_preview: EventAttendeePreview[];
  created_by: string;
  updated_at: string;
};

export type PagedEventResult = {
  list: EventListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
};

type EventListResponse = {
  list: EventListEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}

function unauthorized<T>(): ApiEnvelope<T> {
  return {
    status: "UNAUTHORIZED",
    message: "Sesi berakhir. Silakan masuk kembali.",
  };
}

export type ListEventsOptions = {
  search?: string;
  entityType?: EventEntityTypeEnum;
  entityId?: string;
  page?: number;
  pageSize?: number;
};

export async function listEvents(
  options: ListEventsOptions = {},
): Promise<PagedEventResult> {
  const token = await sessionToken();
  const page = options.page ?? 1;
  if (!token) return { list: [], totalData: 0, totalPage: 1, currentPage: page };

  const result = await callApi<EventListResponse>("/api/v1/events/list", {
    method: "POST",
    token,
    body: {
      ...(options.search ? { search: options.search } : {}),
      ...(options.entityType ? { entity_type: options.entityType } : {}),
      ...(options.entityId ? { entity_id: options.entityId } : {}),
      page,
      page_size: options.pageSize ?? 12,
    },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listEvents] request failed:", result);
    return { list: [], totalData: 0, totalPage: 1, currentPage: page };
  }

  const list = result.data?.list ?? [];
  return {
    list,
    totalData: result.data?.metapaging?.total_data ?? list.length,
    totalPage: result.data?.metapaging?.total_page ?? 1,
    currentPage: result.data?.metapaging?.current_page ?? page,
  };
}

export type EventAttendeePreview = {
  id: string;
  name: string;
  avatar?: string | null;
};

const ALL_EVENTS_PAGE_SIZE = 100;
const ALL_EVENTS_MAX_PAGES = 20;

// events/list sorts oldest-first; keep upcoming events first and recent ended events after them.
export async function listEventsChronological({
  page = 1,
  pageSize = 12,
  ...filters
}: ListEventsOptions = {}): Promise<PagedEventResult> {
  const all: EventListEntry[] = [];
  for (let current = 1; current <= ALL_EVENTS_MAX_PAGES; current += 1) {
    const result = await listEvents({
      ...filters,
      page: current,
      pageSize: ALL_EVENTS_PAGE_SIZE,
    });
    all.push(...result.list);
    if (current >= result.totalPage) break;
  }

  const now = Date.now();
  const upcoming = all.filter((event) => new Date(event.end_date).getTime() >= now);
  const past = all
    .filter((event) => new Date(event.end_date).getTime() < now)
    .reverse();
  const rows = [...upcoming, ...past];
  const totalPage = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPage);

  return {
    list: rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    totalData: rows.length,
    totalPage,
    currentPage,
  };
}

export async function getEventDetail(id: string): Promise<EventDetail | null> {
  const token = await sessionToken();
  if (!token) return null;
  const result = await callApi<EventDetail>("/api/v1/events/detail", {
    method: "POST",
    token,
    body: { id },
  });
  if (!isSuccessStatus(result.status) || !result.data) return null;
  // Keep older backend responses safe while the attendee preview rollout completes.
  return {
    ...result.data,
    contacts: result.data.contacts ?? [],
    images: result.data.images ?? [],
    attendee_preview: result.data.attendee_preview ?? [],
  };
}

export type EventContactInput =
  | { user_id: string; name?: never; phone_number?: never }
  | { user_id?: never; name: string; phone_number: string };

export type EventCategory = { id: number; name: string };

export async function listEventCategories(): Promise<EventCategory[]> {
  const token = await sessionToken();
  if (!token) return [];
  const categories: EventCategory[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const result = await callApi<{ list: EventCategory[]; metapaging?: { total_page: number } }>(
      "/api/v1/event-categories/list",
      { method: "POST", token, body: { page, page_size: 100 } },
    );
    if (!isSuccessStatus(result.status) || !result.data) {
      throw new Error(result.message || "Kategori event gagal dimuat.");
    }
    categories.push(...result.data.list);
    if (page >= (result.data.metapaging?.total_page ?? 1)) break;
  }
  return categories;
}

export type CreateEventPayload = {
  title: string;
  category_id: number;
  description?: string;
  entity_type: EventEntityTypeEnum;
  entity_id: string;
  start_date: string;
  end_date: string;
  location_name?: string;
  location_url?: string;
  link_url?: string;
};

export async function createEvent(
  payload: CreateEventPayload,
): Promise<ApiEnvelope<EventDetail>> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi<EventDetail>("/api/v1/events/create", {
    method: "POST",
    token,
    body: payload,
  });
}

export type UpdateEventPayload = Partial<CreateEventPayload> & { id: string };

export async function updateEvent(
  payload: UpdateEventPayload,
): Promise<ApiEnvelope<EventDetail>> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi<EventDetail>("/api/v1/events/update", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function createEventContact(eventId: string, contact: EventContactInput) {
  const token = await sessionToken();
  if (!token) return unauthorized<EventContact>();
  return callApi<EventContact>("/api/v1/events/contacts/create", {
    method: "POST", token, body: { event_id: eventId, ...contact },
  });
}

export async function updateEventContact(id: string, contact: EventContactInput) {
  const token = await sessionToken();
  if (!token) return unauthorized<EventContact>();
  return callApi<EventContact>("/api/v1/events/contacts/update", {
    method: "POST", token, body: { id, ...contact },
  });
}

export async function deleteEventContact(id: string) {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi("/api/v1/events/contacts/delete", { method: "POST", token, body: { id } });
}

export async function listEventImages(eventId: string): Promise<EventImage[] | null> {
  const token = await sessionToken();
  if (!token) return null;
  const result = await callApi<{ list: EventImage[] }>("/api/v1/events/images/list", {
    method: "POST", token, body: { event_id: eventId, page: 1, page_size: 100 },
  });
  return isSuccessStatus(result.status) && result.data ? result.data.list : null;
}

export async function createEventImage(eventId: string, role: EventImage["role"], mediaId: string) {
  const token = await sessionToken();
  if (!token) return unauthorized<EventImage>();
  return callApi<EventImage>("/api/v1/events/images/create", {
    method: "POST", token, body: { event_id: eventId, role, media_id: mediaId },
  });
}

export async function updateEventImage(id: string, mediaId: string) {
  const token = await sessionToken();
  if (!token) return unauthorized<EventImage>();
  return callApi<EventImage>("/api/v1/events/images/update", {
    method: "POST", token, body: { id, media_id: mediaId },
  });
}

export async function deleteEventImage(id: string) {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi("/api/v1/events/images/delete", { method: "POST", token, body: { id } });
}

export async function deleteEvent(id: string): Promise<ApiEnvelope> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi("/api/v1/events/delete", {
    method: "POST",
    token,
    body: { id },
  });
}

export type EventAttendanceResult = {
  event_id: string;
  user_id: string;
  is_attending: boolean;
  attendee_count: number;
};

export async function updateEventAttendance(
  eventId: string,
  isAttending: boolean,
): Promise<ApiEnvelope<EventAttendanceResult>> {
  const token = await sessionToken();
  if (!token) return unauthorized();
  return callApi<EventAttendanceResult>("/api/v1/events/attendance/update", {
    method: "POST",
    token,
    body: { event_id: eventId, is_attending: isAttending },
  });
}
