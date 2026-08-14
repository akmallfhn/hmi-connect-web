import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { isSuccessStatus, type StatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type CoordinatingChapterDetail = {
  id: string;
  branch_id: string;
  branch_name: string;
  name: string;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
};

export async function getCoordinatingChapterDetail(
  id: string
): Promise<CoordinatingChapterDetail | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const result = await callApi<CoordinatingChapterDetail>(
    "/api/v1/coordinating-chapters/detail",
    {
      method: "POST",
      token: sessionToken,
      body: { id },
    }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}
