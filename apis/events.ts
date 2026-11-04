import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isSuccessStatus, type EventEntityTypeEnum } from "@/lib/types";
import { callApi, type ApiEnvelope } from "./api";

export type EventContact = {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  position: number;
};

export type EventImage = {
  media_id: string;
  position: number;
  image_url?: string;
};

export type EventListEntry = {
  id: string;
  title: string;
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
  registration_url?: string;
  contacts: EventContact[];
  images: EventImage[];
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
  avatar?: string;
};

const SAMPLE_ATTENDEES: EventAttendeePreview[] = [
  { id: "sample-1", name: "Rizky", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "sample-2", name: "Salsabila", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "sample-3", name: "Fajar", avatar: "https://randomuser.me/api/portraits/men/46.jpg" },
  { id: "sample-4", name: "Nadia", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: "sample-5", name: "Hafiz", avatar: "https://randomuser.me/api/portraits/men/75.jpg" },
  { id: "sample-6", name: "Aulia", avatar: "https://randomuser.me/api/portraits/women/21.jpg" },
  { id: "sample-7", name: "Yusuf", avatar: "https://randomuser.me/api/portraits/men/11.jpg" },
];

// No attendee endpoint exists yet; samples stay local-only so members never see invented people attending.
export function listEventAttendeePreview(): EventAttendeePreview[] {
  return process.env.DOMAIN_MODE === "local" ? SAMPLE_ATTENDEES : [];
}

export type EventTimeframe = "upcoming" | "past";

const ALL_EVENTS_PAGE_SIZE = 100;
const ALL_EVENTS_MAX_PAGES = 20;

export type TimeframedEventResult = PagedEventResult & {
  upcomingCount: number;
  pastCount: number;
};

// events/list sorts oldest-first with no time filter, so ended events would otherwise lead every catalog.
export async function listEventsByTimeframe({
  timeframe,
  page = 1,
  pageSize = 12,
  ...filters
}: ListEventsOptions & { timeframe: EventTimeframe }): Promise<TimeframedEventResult> {
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
  const rows = timeframe === "past" ? past : upcoming;
  const totalPage = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPage);

  return {
    list: rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    totalData: rows.length,
    totalPage,
    currentPage,
    upcomingCount: upcoming.length,
    pastCount: past.length,
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
  // Both keys are omitempty on the backend, so an event without any comes back with neither.
  return {
    ...result.data,
    contacts: result.data.contacts ?? [],
    images: result.data.images ?? [],
  };
}

export type EventContactInput = {
  name: string;
  phone_number?: string;
  email?: string;
};

export type CreateEventPayload = {
  title: string;
  description?: string;
  entity_type: EventEntityTypeEnum;
  entity_id: string;
  start_date: string;
  end_date: string;
  location_name?: string;
  location_url?: string;
  registration_url?: string;
  thumbnail_media_id?: string;
  contacts?: EventContactInput[];
  image_media_ids?: string[];
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
