import "server-only";

import { listPublicBranches } from "@/apis/branches";
import { listPublicCoordinatingBodies } from "@/apis/coordinating-bodies";
import {
  NO_COORDINATING_BODY_FILTER,
  NO_COORDINATING_BODY_LABEL,
} from "./constants";
import {
  CHAPTER_CENSUS_LIMITS as LIMITS,
  EMAIL_PATTERN,
  type ChapterCensusPayload,
  type ChapterCensusResult,
} from "./chapter-census-shared";
import { CensusSheetsNotConfiguredError, saveChapterCensus } from "./chapter-census-sheets";

const TYPE_LABEL = { full: "Penuh", provisional: "Persiapan" } as const;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Re-resolves the picked Badko and Cabang server-side, so the response never carries a name the client made up.
export async function submitChapterCensus(
  payload: ChapterCensusPayload
): Promise<ChapterCensusResult> {
  if (payload.website) return { ok: true };

  const fullName = clean(payload.fullName, LIMITS.name);
  const email = clean(payload.email, LIMITS.email);
  const position = clean(payload.position, LIMITS.position);
  if (!fullName || !position || !EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "Lengkapi nama, email yang valid, dan jabatan." };
  }

  const rawChapters = Array.isArray(payload.chapters) ? payload.chapters : [];
  if (rawChapters.length > LIMITS.chapters) {
    return { ok: false, message: `Maksimal ${LIMITS.chapters} Komisariat per pengiriman.` };
  }
  const chapters = rawChapters.map((chapter) => ({
    name: clean(chapter?.name, LIMITS.chapterName),
    campus: clean(chapter?.campus, LIMITS.chapterCampus),
    type: chapter?.type === "provisional" ? TYPE_LABEL.provisional : TYPE_LABEL.full,
  }));
  if (chapters.length === 0 || chapters.some((chapter) => !chapter.name)) {
    return { ok: false, message: "Isi nama untuk setiap Komisariat." };
  }

  const [coordinatingBodies, branches] = await Promise.all([
    listPublicCoordinatingBodies(),
    listPublicBranches(),
  ]);
  const noBadko = payload.coordinatingBodyId === NO_COORDINATING_BODY_FILTER;
  const coordinatingBody = noBadko
    ? NO_COORDINATING_BODY_LABEL
    : coordinatingBodies.find((row) => row.id === payload.coordinatingBodyId)?.name;
  const branch = branches.find(
    (row) =>
      row.id === payload.branchId &&
      row.coordinating_body_id === (noBadko ? null : payload.coordinatingBodyId)
  );
  if (!coordinatingBody || !branch) {
    return { ok: false, message: "Badko atau Cabang tidak ditemukan. Pilih ulang." };
  }

  const data = {
    fullName,
    email,
    position,
    coordinatingBody,
    branch: branch.name,
    chapters,
    submittedAt: `${new Date().toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    })} WIB`,
  };

  try {
    await saveChapterCensus(data);
  } catch (err) {
    console.error("[submitChapterCensus] save failed:", err);
    if (err instanceof CensusSheetsNotConfiguredError) {
      return { ok: false, message: "Formulir belum siap menerima data. Hubungi pengurus HMI Connect." };
    }
    return { ok: false, message: "Data gagal dikirim. Coba lagi beberapa saat lagi." };
  }
  return { ok: true };
}
