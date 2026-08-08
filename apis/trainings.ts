import "server-only";

import { render } from "@react-email/components";
import { cookies } from "next/headers";
import { after } from "next/server";
import { TrainingResultEmail } from "@/components/emails/TrainingResultEmail";
import { getMainSiteOrigin, SESSION_COOKIE_NAME } from "@/lib/constants";
import { sendEmail } from "@/lib/mailtrap";
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
  is_registration_open: boolean;
  is_evaluation_locked: boolean;
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
  is_registration_open?: boolean;
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
  is_registration_open?: boolean;
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

export type TrainingEvaluationMaterialScore = {
  training_material_id: string;
  score: number;
};

export type TrainingEvaluationMaterial = {
  training_material_id: string;
  title: string;
};

export type TrainingEvaluationEntry = {
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_email: string;
  user_avatar?: string;
  material_scores: TrainingEvaluationMaterialScore[];
  aff_discipline?: number;
  aff_ethics?: number;
  aff_motivation?: number;
  aff_teamwork?: number;
  psym_public_speaking?: number;
  psym_discussion_leadership?: number;
  psym_report_writing?: number;
  psym_role_simulation?: number;
  cognitive_average: number;
  affective_average: number;
  psychomotor_average: number;
  final_score: number;
  is_complete: boolean;
};

export type TrainingEvaluationMatrix = {
  trainingId: string;
  level: TrainingStatusEnum;
  affectiveWeight: number;
  cognitiveWeight: number;
  psychomotorWeight: number;
  materials: TrainingEvaluationMaterial[];
  list: TrainingEvaluationEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
};

type TrainingEvaluationMatrixResponse = {
  training_id: string;
  level: TrainingStatusEnum;
  affective_weight: number;
  cognitive_weight: number;
  psychomotor_weight: number;
  materials: TrainingEvaluationMaterial[];
  list: TrainingEvaluationEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type ListTrainingEvaluationsOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listTrainingEvaluations(
  trainingId: string,
  options: ListTrainingEvaluationsOptions = {}
): Promise<TrainingEvaluationMatrix | null> {
  const sessionToken = await getSessionToken();
  const page = options.page ?? 1;
  if (!sessionToken) return null;

  const result = await callApi<TrainingEvaluationMatrixResponse>(
    "/api/v1/trainings/evaluations/list",
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

  if (!isSuccessStatus(result.status) || !result.data) {
    console.error("[listTrainingEvaluations] request failed:", result);
    return null;
  }

  const data = result.data;
  return {
    trainingId: data.training_id,
    level: data.level,
    affectiveWeight: data.affective_weight,
    cognitiveWeight: data.cognitive_weight,
    psychomotorWeight: data.psychomotor_weight,
    materials: data.materials ?? [],
    list: data.list ?? [],
    totalData: data.metapaging?.total_data ?? data.list?.length ?? 0,
    totalPage: data.metapaging?.total_page ?? 1,
    currentPage: data.metapaging?.current_page ?? page,
  };
}

export type UpdateTrainingEvaluationPayload = {
  training_id: string;
  user_id: string;
  material_scores?: TrainingEvaluationMaterialScore[];
  aff_discipline?: number;
  aff_ethics?: number;
  aff_motivation?: number;
  aff_teamwork?: number;
  psym_public_speaking?: number;
  psym_discussion_leadership?: number;
  psym_report_writing?: number;
  psym_role_simulation?: number;
};

export async function updateTrainingEvaluation(
  payload: UpdateTrainingEvaluationPayload
): Promise<ApiEnvelope<TrainingEvaluationEntry>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  return callApi<TrainingEvaluationEntry>("/api/v1/trainings/evaluations/update", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export type TrainingEvaluationLockResult = {
  training_id: string;
  is_evaluation_locked: boolean;
  total_participants: number;
  passed_total: number;
  conditional_pass_total: number;
  failed_total: number;
};

const TRAINING_EMAIL_PAGE_SIZE = 100;
const TRAINING_EMAIL_BATCH_SIZE = 5;

async function getTrainingParticipantEmailPage(
  trainingId: string,
  sessionToken: string,
  page: number
): Promise<ApiEnvelope<ListResponse<TrainingParticipant>>> {
  return callApi<ListResponse<TrainingParticipant>>(
    "/api/v1/trainings/participants/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        training_id: trainingId,
        page,
        page_size: TRAINING_EMAIL_PAGE_SIZE,
      },
    }
  );
}

function getTrainingResultEmailSubject(
  result: TrainingResultEnum,
  trainingName: string
) {
  if (result === "passed") return `Selamat! Kamu Lulus ${trainingName}`;
  if (result === "conditional_pass") {
    return `Selamat! Kamu Lulus Bersyarat ${trainingName}`;
  }
  return `Pengumuman Hasil ${trainingName}`;
}

async function sendTrainingResultEmail(
  participant: TrainingParticipant,
  training: TrainingDetail
) {
  if (!participant.user_email || !participant.result) return;

  const html = await render(
    TrainingResultEmail({
      fullName: participant.user_full_name,
      trainingName: training.name,
      trainingUrl: `${getMainSiteOrigin()}/trainings/${training.id}`,
      result: participant.result,
    })
  );

  await sendEmail({
    mailRecipients: [participant.user_email],
    mailSubject: getTrainingResultEmailSubject(
      participant.result,
      training.name
    ),
    mailHtml: html,
  });
}

async function sendTrainingResultEmails(
  trainingId: string,
  sessionToken: string
) {
  const [trainingResult, firstPageResult] = await Promise.all([
    callApi<TrainingDetail>("/api/v1/trainings/detail", {
      method: "POST",
      token: sessionToken,
      body: { id: trainingId },
    }),
    getTrainingParticipantEmailPage(trainingId, sessionToken, 1),
  ]);

  if (!isSuccessStatus(trainingResult.status) || !trainingResult.data) {
    console.error(
      "[lockTrainingEvaluations] failed to load training for result emails:",
      trainingResult
    );
    return;
  }
  if (!isSuccessStatus(firstPageResult.status) || !firstPageResult.data) {
    console.error(
      "[lockTrainingEvaluations] failed to load participants for result emails:",
      firstPageResult
    );
    return;
  }

  const training = trainingResult.data;
  const totalPages = firstPageResult.data.metapaging?.total_page ?? 1;
  const remainingPageResults = await Promise.allSettled(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
      getTrainingParticipantEmailPage(trainingId, sessionToken, index + 2)
    )
  );
  const participants = [...firstPageResult.data.list];

  remainingPageResults.forEach((pageResult, index) => {
    if (pageResult.status === "rejected") {
      console.error(
        `[lockTrainingEvaluations] failed to load participant email page ${index + 2}:`,
        pageResult.reason
      );
      return;
    }
    if (
      !isSuccessStatus(pageResult.value.status) ||
      !pageResult.value.data
    ) {
      console.error(
        `[lockTrainingEvaluations] failed to load participant email page ${index + 2}:`,
        pageResult.value
      );
      return;
    }
    participants.push(...pageResult.value.data.list);
  });

  const recipients = participants.filter(
    (participant) => participant.user_email && participant.result
  );
  for (
    let index = 0;
    index < recipients.length;
    index += TRAINING_EMAIL_BATCH_SIZE
  ) {
    const batch = recipients.slice(index, index + TRAINING_EMAIL_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((participant) =>
        sendTrainingResultEmail(participant, training)
      )
    );
    results.forEach((emailResult, resultIndex) => {
      if (emailResult.status === "rejected") {
        console.error(
          `[lockTrainingEvaluations] failed to send result email for participant ${batch[resultIndex].user_id}:`,
          emailResult.reason
        );
      }
    });
  }
}

export async function lockTrainingEvaluations(
  trainingId: string
): Promise<ApiEnvelope<TrainingEvaluationLockResult>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Sesi berakhir. Silakan masuk kembali.",
    };
  }
  const result = await callApi<TrainingEvaluationLockResult>(
    "/api/v1/trainings/evaluations/lock",
    {
      method: "POST",
      token: sessionToken,
      body: { training_id: trainingId },
    }
  );

  if (isSuccessStatus(result.status)) {
    after(async () => {
      try {
        await sendTrainingResultEmails(trainingId, sessionToken);
      } catch (error) {
        console.error(
          "[lockTrainingEvaluations] result email job threw:",
          error
        );
      }
    });
  }

  return result;
}
