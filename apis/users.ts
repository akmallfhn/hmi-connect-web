import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import type { Degree, TrainingResultEnum, UserStatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type ActivationPayload = {
  branch_id: string;
  training_result: TrainingResultEnum;
  training_organizer_name: string;
  training_year: number;
  education_institution_id: number;
  education_degree: Degree;
  education_major: string;
  education_start_year: number;
  education_end_year: number;
};

export type ActivationResult = {
  user_id: string;
  branch_id: string;
  username: string;
  user_email: string;
  status: UserStatusEnum;
};

export async function activateUser(
  payload: ActivationPayload
): Promise<ApiEnvelope<ActivationResult>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<ActivationResult>("/api/v1/users/activation", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}
