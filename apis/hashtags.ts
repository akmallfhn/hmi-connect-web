import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isSuccessStatus } from "@/lib/types";

export type HashtagSuggestion = {
  id: number;
  name: string;
  feed_count: number;
};

type HashtagListResponse = {
  list?: HashtagSuggestion[];
};

export async function searchHashtags(
  search: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<HashtagSuggestion[]> {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return [];

  const result = await callApi<HashtagListResponse>("/api/v1/hashtags/list", {
    method: "POST",
    token: sessionToken,
    body: {
      search,
      page: options.page ?? 1,
      page_size: options.pageSize ?? 6,
    },
  });
  if (!isSuccessStatus(result.status)) {
    console.error("[searchHashtags] request failed:", result);
    return [];
  }
  return result.data?.list ?? [];
}
