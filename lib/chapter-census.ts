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
import { sendEmail } from "./mailtrap";

const CHAPTER_CENSUS_RECIPIENT = "akmalluthfiansyah@gmail.com";

const TYPE_LABEL = { full: "Penuh", provisional: "Persiapan" } as const;

type CensusChapterRow = { name: string; campus: string; type: string };

type CensusEmail = {
  fullName: string;
  email: string;
  position: string;
  coordinatingBody: string;
  branch: string;
  chapters: CensusChapterRow[];
  submittedAt: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const CELL = "padding:10px 12px;border-bottom:1px solid #e6e9ef;font-size:14px;color:#172033;";
const HEAD = "padding:10px 12px;background:#f5f7fb;font-size:12px;color:#5f6573;text-align:left;text-transform:uppercase;letter-spacing:.04em;";
const LABEL = "padding:8px 0;font-size:13px;color:#5f6573;width:140px;vertical-align:top;";
const VALUE = "padding:8px 0;font-size:14px;color:#172033;font-weight:600;";

function renderEmail(data: CensusEmail) {
  const info = [
    ["Nama", data.fullName],
    ["Email", data.email],
    ["Jabatan", data.position],
    ["Badko", data.coordinatingBody],
    ["Cabang", data.branch],
    ["Dikirim", data.submittedAt],
  ]
    .map(
      ([key, value]) =>
        `<tr><td style="${LABEL}">${key}</td><td style="${VALUE}">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  const chapters = data.chapters
    .map(
      (chapter, index) =>
        `<tr><td style="${CELL}">${index + 1}</td><td style="${CELL}font-weight:600;">${escapeHtml(chapter.name)}</td><td style="${CELL}">${escapeHtml(chapter.campus || "—")}</td><td style="${CELL}">${chapter.type}</td></tr>`
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e9ef;">
<tr><td style="background:#159fa2;padding:24px;color:#ffffff;"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;">HMI Connect</div><div style="font-size:22px;font-weight:700;margin-top:4px;">Pendataan Komisariat</div><div style="font-size:14px;margin-top:4px;opacity:.9;">Cabang ${escapeHtml(data.branch)} &middot; ${data.chapters.length} Komisariat</div></td></tr>
<tr><td style="padding:20px 24px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${info}</table></td></tr>
<tr><td style="padding:8px 24px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e9ef;border-radius:12px;border-collapse:separate;overflow:hidden;">
<tr><th style="${HEAD}">No</th><th style="${HEAD}">Nama Komisariat</th><th style="${HEAD}">Asal Kampus</th><th style="${HEAD}">Status</th></tr>${chapters}</table></td></tr>
</table></td></tr></table></body></html>`;
}

function renderText(data: CensusEmail) {
  return [
    `Pendataan Komisariat — Cabang ${data.branch}`,
    `Nama: ${data.fullName}`,
    `Email: ${data.email}`,
    `Jabatan: ${data.position}`,
    `Badko: ${data.coordinatingBody}`,
    `Cabang: ${data.branch}`,
    `Dikirim: ${data.submittedAt}`,
    "",
    ...data.chapters.map(
      (chapter, index) =>
        `${index + 1}. ${chapter.name}${chapter.campus ? ` (${chapter.campus})` : ""} — ${chapter.type}`
    ),
  ].join("\n");
}

// Re-resolves the picked Badko and Cabang server-side, so the email never carries a name the client made up.
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

  const data: CensusEmail = {
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
    await sendEmail({
      mailRecipients: [CHAPTER_CENSUS_RECIPIENT],
      mailSubject: `Pendataan Komisariat — Cabang ${branch.name} (${chapters.length})`,
      mailBody: renderText(data),
      mailHtml: renderEmail(data),
    });
  } catch (err) {
    console.error("[submitChapterCensus] send failed:", err);
    return { ok: false, message: "Data gagal dikirim. Coba lagi beberapa saat lagi." };
  }
  return { ok: true };
}
