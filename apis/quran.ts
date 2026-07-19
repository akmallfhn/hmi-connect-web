import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { isSuccessStatus, type RevelationPlaceEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type QuranSurah = {
  id: number;
  number: number;
  name_arabic: string;
  name_latin: string;
  name_translation: string;
  slug: string;
  revelation_place: RevelationPlaceEnum;
  audio?: string;
  total_verses: number;
  estimated_reading_seconds: number;
};

export type QuranJuz = {
  id: number;
  number: number;
  estimated_reading_seconds: number;
};

export type QuranVerse = {
  id: number;
  number: number;
  text_arabic: string;
  text_latin: string;
  translation_id: string;
  audio?: string;
};

export type QuranSurahDetail = QuranSurah & {
  description: string;
  verses: QuranVerse[];
};

// A juz's verses can span more than one surah, so each verse also carries its own surah's
// id/number/name — everything QuranVerse has, plus that.
export type QuranJuzVerse = QuranVerse & {
  surah_id: number;
  surah_number: number;
  surah_name_latin: string;
};

export type QuranJuzDetail = QuranJuz & {
  verses: QuranJuzVerse[];
};

type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

type ListResponse<T> = {
  list: T[];
  metapaging?: Metapaging;
};

// The backend caps page_size at 100, so a single call can't cover all 114 surahs.
const MAX_PAGE_SIZE = 100;

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

function hasMoreFromMetapaging(metapaging?: Metapaging): boolean {
  return metapaging ? metapaging.current_page < metapaging.total_page : false;
}

export async function listQuranSurahs(
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: QuranSurah[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<QuranSurah>>(
    "/api/v1/quran-surahs/list",
    {
      method: "POST",
      token: sessionToken,
      body: { page, page_size: pageSize },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listQuranSurahs] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

// Quran surahs/juz are a small, fixed, seeded dataset — the /quran page fetches all of it
// upfront and filters client-side rather than debouncing search requests page by page.
export async function listAllQuranSurahs(): Promise<QuranSurah[]> {
  const all: QuranSurah[] = [];
  let page = 1;
  for (;;) {
    const { list, hasMore } = await listQuranSurahs({
      page,
      pageSize: MAX_PAGE_SIZE,
    });
    all.push(...list);
    if (!hasMore) break;
    page += 1;
  }
  return all;
}

export async function listQuranJuz(
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: QuranJuz[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<QuranJuz>>(
    "/api/v1/quran-juz/list",
    {
      method: "POST",
      token: sessionToken,
      body: { page, page_size: pageSize },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listQuranJuz] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export async function getQuranSurahDetail(
  slug: string
): Promise<QuranSurahDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<QuranSurahDetail>(
    "/api/v1/quran-surahs/detail",
    {
      method: "POST",
      token: sessionToken,
      body: { slug },
    }
  );

  if (!isSuccessStatus(result.status) || !result.data) {
    console.error("[getQuranSurahDetail] request failed:", result);
    return null;
  }

  return result.data;
}

export async function getQuranJuzDetail(
  id: number
): Promise<QuranJuzDetail | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<QuranJuzDetail>("/api/v1/quran-juz/detail", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });

  if (!isSuccessStatus(result.status) || !result.data) {
    console.error("[getQuranJuzDetail] request failed:", result);
    return null;
  }

  return result.data;
}

export async function listAllQuranJuz(): Promise<QuranJuz[]> {
  const all: QuranJuz[] = [];
  let page = 1;
  for (;;) {
    const { list, hasMore } = await listQuranJuz({
      page,
      pageSize: MAX_PAGE_SIZE,
    });
    all.push(...list);
    if (!hasMore) break;
    page += 1;
  }
  return all;
}
