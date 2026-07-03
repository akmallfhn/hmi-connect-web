import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "./session";

export type Branch = {
  id: string;
  name: string;
};

export async function getBranches(): Promise<Branch[]> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const result = await callApi<Branch[]>("/api/v1/branches/list", {
    method: "POST",
    token: sessionToken,
    body: {
      organization_id: process.env.ORGANIZATION_ID,
      status: "active",
    },
  });

  return result.data ?? [];
}
