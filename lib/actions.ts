"use server";

import { cookies } from "next/headers";
import { callApi } from "@/apis/api";
import { SESSION_COOKIE_NAME } from "@/apis/session";

export type VerifyTraining = {
  level: string;
  result: string;
  organizer_name: string;
  year: number;
};

export type Degree =
  | "diploma_ahli_pratama"
  | "diploma_ahli_muda"
  | "diploma_ahli_madya"
  | "sarjana"
  | "magister"
  | "doktor";

export type VerifyEducation = {
  institution_name: string;
  degree: string;
  major: string;
  start_year: number;
  end_year: number;
};

export type VerifyPayload = {
  branch_id: string;
  trainings: VerifyTraining[];
  educations: VerifyEducation[];
  has_senior_course: boolean;
};

export type VerifyResult = {
  user_id: string;
  branch_id: string;
  username: string;
  user_email: string;
  is_verified: boolean;
};

export async function verifyUser(payload: VerifyPayload) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return { success: false, message: "Session expired. Please log in again." };
  }

  return callApi<VerifyResult>("/api/v1/users/update/verification", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}
