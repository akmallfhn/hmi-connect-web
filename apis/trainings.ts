import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import {
  isSuccessStatus,
  type TrainingOrganizerTypeEnum,
  type TrainingResultEnum,
  type TrainingStatusEnum,
} from "@/lib/types";
import { callApi, type ApiEnvelope } from "./api";

export type TrainingListEntry = {
  id: string;
  name: string;
  level: TrainingStatusEnum;
  organizer_type: TrainingOrganizerTypeEnum;
  organizer_id: string;
  organizer_name?: string;
  start_date: string;
  end_date: string;
  location_name?: string;
  image_url?: string;
  created_at: string;
};

export type TrainingDetail = TrainingListEntry & {
  description?: string;
  contact_person_id?: string;
  contact_person_name?: string;
  contact_person_avatar?: string;
  contact_person_phone_number?: string;
  location_url?: string;
  updated_at: string;
};

export type TrainingMaterial = {
  id: string;
  training_id: string;
  title: string;
  material_url?: string;
  index: number;
  created_at: string;
  updated_at: string;
};

export type TrainingParticipant = {
  training_id: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_email: string;
  user_avatar?: string;
  paper_url?: string;
  result?: TrainingResultEnum;
  created_at: string;
  updated_at: string;
};

export type PagedTrainingResult<T> = {
  list: T[];
  totalData: number;
  totalPage: number;
  currentPage: number;
};

type ListResponse<T> = {
  list: T[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

async function getTrainingReadToken() {
  return process.env.CLIENT_SECRET ?? (await getSessionToken());
}

function emptyPage<T>(page = 1): PagedTrainingResult<T> {
  return { list: [], totalData: 0, totalPage: 1, currentPage: page };
}

function mapPage<T>(
  data: ListResponse<T> | undefined,
  fallbackPage: number
): PagedTrainingResult<T> {
  const list = data?.list ?? [];
  return {
    list,
    totalData: data?.metapaging?.total_data ?? list.length,
    totalPage: data?.metapaging?.total_page ?? 1,
    currentPage: data?.metapaging?.current_page ?? fallbackPage,
  };
}

export type ListTrainingsOptions = {
  search?: string;
  level?: TrainingStatusEnum;
  organizerType?: TrainingOrganizerTypeEnum;
  organizerId?: string;
  page?: number;
  pageSize?: number;
};

export async function listTrainings(
  options: ListTrainingsOptions = {}
): Promise<PagedTrainingResult<TrainingListEntry>> {
  const authToken = await getTrainingReadToken();
  const page = options.page ?? 1;
  if (!authToken) return emptyPage(page);

  const result = await callApi<ListResponse<TrainingListEntry>>(
    "/api/v1/trainings/list",
    {
      method: "POST",
      token: authToken,
      body: {
        ...(options.search ? { search: options.search } : {}),
        ...(options.level ? { level: options.level } : {}),
        ...(options.organizerType
          ? { organizer_type: options.organizerType }
          : {}),
        ...(options.organizerId ? { organizer_id: options.organizerId } : {}),
        page,
        page_size: options.pageSize ?? 20,
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listTrainings] request failed:", result);
    return emptyPage(page);
  }
  return mapPage(result.data, page);
}

export async function getTrainingDetail(
  id: string
): Promise<TrainingDetail | null> {
  const authToken = await getTrainingReadToken();
  if (!authToken) return null;

  const result = await callApi<TrainingDetail>("/api/v1/trainings/detail", {
    method: "POST",
    token: authToken,
    body: { id },
  });
  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type RegisterTrainingPayload = {
  training_id: string;
  paper_url?: string;
};

export async function registerTraining(
  payload: RegisterTrainingPayload
): Promise<ApiEnvelope<TrainingParticipant>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Silakan masuk untuk mendaftar training.",
    };
  }

  return callApi<TrainingParticipant>("/api/v1/trainings/register", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type CreateTrainingPayload = {
  name: string;
  description?: string;
  level: TrainingStatusEnum;
  organizer_type: TrainingOrganizerTypeEnum;
  organizer_id: string;
  contact_person_id: string;
  start_date: string;
  end_date: string;
  location_name?: string;
  location_url?: string;
  image_url?: string;
};

export async function createTraining(
  payload: CreateTrainingPayload
): Promise<ApiEnvelope<TrainingDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  return callApi<TrainingDetail>("/api/v1/trainings/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateTrainingPayload = {
  id: string;
  name?: string;
  description?: string;
  level?: TrainingStatusEnum;
  organizer_type?: TrainingOrganizerTypeEnum;
  organizer_id?: string;
  contact_person_id?: string;
  start_date?: string;
  end_date?: string;
  location_name?: string;
  location_url?: string;
  image_url?: string;
};

export async function updateTraining(
  payload: UpdateTrainingPayload
): Promise<ApiEnvelope<TrainingDetail>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  return callApi<TrainingDetail>("/api/v1/trainings/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function deleteTraining(id: string): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  return callApi("/api/v1/trainings/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export type ListTrainingMaterialsOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listTrainingMaterials(
  trainingId: string,
  options: ListTrainingMaterialsOptions = {}
): Promise<PagedTrainingResult<TrainingMaterial>> {
  const sessionToken = await getSessionToken();
  const page = options.page ?? 1;
  if (!sessionToken) return emptyPage(page);

  const result = await callApi<ListResponse<TrainingMaterial>>(
    "/api/v1/trainings/materials/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        training_id: trainingId,
        ...(options.search ? { search: options.search } : {}),
        page,
        page_size: options.pageSize ?? 20,
      },
    }
  );
  if (!isSuccessStatus(result.status)) {
    console.error("[listTrainingMaterials] request failed:", result);
    return emptyPage(page);
  }
  return mapPage(result.data, page);
}

export async function getTrainingMaterialDetail(
  id: string
): Promise<TrainingMaterial | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<TrainingMaterial>(
    "/api/v1/trainings/materials/detail",
    { method: "POST", token: sessionToken, body: { id } }
  );
  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type CreateTrainingMaterialPayload = {
  training_id: string;
  title: string;
  material_url?: string;
  index: number;
};

export async function createTrainingMaterial(
  payload: CreateTrainingMaterialPayload
): Promise<ApiEnvelope<TrainingMaterial>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  return callApi<TrainingMaterial>("/api/v1/trainings/materials/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type UpdateTrainingMaterialPayload = {
  id: string;
  training_id?: string;
  title?: string;
  material_url?: string;
  index?: number;
};

export async function updateTrainingMaterial(
  payload: UpdateTrainingMaterialPayload
): Promise<ApiEnvelope<TrainingMaterial>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  return callApi<TrainingMaterial>("/api/v1/trainings/materials/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function deleteTrainingMaterial(id: string): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  return callApi("/api/v1/trainings/materials/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export type ListTrainingParticipantsOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listTrainingParticipants(
  trainingId: string,
  options: ListTrainingParticipantsOptions = {}
): Promise<PagedTrainingResult<TrainingParticipant>> {
  const sessionToken = await getSessionToken();
  const page = options.page ?? 1;
  if (!sessionToken) return emptyPage(page);

  const result = await callApi<ListResponse<TrainingParticipant>>(
    "/api/v1/trainings/participants/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        training_id: trainingId,
        ...(options.search ? { search: options.search } : {}),
        page,
        page_size: options.pageSize ?? 20,
      },
    }
  );
  if (!isSuccessStatus(result.status)) {
    console.error("[listTrainingParticipants] request failed:", result);
    return emptyPage(page);
  }
  return mapPage(result.data, page);
}

export async function getTrainingParticipantDetail(
  trainingId: string,
  userId: string
): Promise<TrainingParticipant | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<TrainingParticipant>(
    "/api/v1/trainings/participants/detail",
    {
      method: "POST",
      token: sessionToken,
      body: { training_id: trainingId, user_id: userId },
    }
  );
  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}
