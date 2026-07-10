import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isSuccessStatus } from "@/lib/types";

export type SocialMediaPlatform = {
  id: number;
  name: string;
  logo_url?: string | null;
};

type SocialMediaPlatformsListResponse = {
  list: SocialMediaPlatform[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

export type GetSocialMediaPlatformsOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type GetSocialMediaPlatformsResult = {
  list: SocialMediaPlatform[];
  hasMore: boolean;
};

async function fetchSocialMediaPlatforms(
  options: GetSocialMediaPlatformsOptions = {}
): Promise<GetSocialMediaPlatformsResult> {
  const { search, page, pageSize } = options;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return { list: [], hasMore: false };

  const result = await callApi<SocialMediaPlatformsListResponse>(
    "/api/v1/social-media-platforms/list",
    {
      method: "POST",
      token: sessionToken,
      body: {
        ...(search ? { search } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[fetchSocialMediaPlatforms] request failed:", result);
    return { list: [], hasMore: false };
  }

  const list = result.data?.list ?? [];
  const metapaging = result.data?.metapaging;
  const hasMore = metapaging ? metapaging.current_page < metapaging.total_page : false;
  return { list, hasMore };
}

export async function getSocialMediaPlatforms(
  options: GetSocialMediaPlatformsOptions = {}
): Promise<SocialMediaPlatform[]> {
  const { list } = await fetchSocialMediaPlatforms(options);
  return list;
}

export async function searchSocialMediaPlatforms(
  options: GetSocialMediaPlatformsOptions = {}
): Promise<GetSocialMediaPlatformsResult> {
  return fetchSocialMediaPlatforms(options);
}
