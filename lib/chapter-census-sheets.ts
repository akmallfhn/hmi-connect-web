import "server-only";

import { randomUUID } from "node:crypto";
import { JWT } from "google-auth-library";

export const CHAPTER_CENSUS_SHEET_HEADERS = [
  "Submission ID",
  "Waktu (WIB)",
  "Nama Pengisi",
  "Email",
  "Jabatan",
  "Badko",
  "Cabang",
  "No",
  "Nama Komisariat",
  "Asal Kampus",
  "Status",
] as const;

type CensusSubmission = {
  fullName: string;
  email: string;
  position: string;
  coordinatingBody: string;
  branch: string;
  chapters: { name: string; campus: string; type: string }[];
  submittedAt: string;
};

export class CensusSheetsNotConfiguredError extends Error {
  constructor() {
    super("Google Sheets census credentials and spreadsheet ID must be set.");
  }
}

// One row per Komisariat; the shared submission ID groups rows from the same response.
export async function saveChapterCensus(data: CensusSubmission) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  if (!email || !key || !spreadsheetId) throw new CensusSheetsNotConfiguredError();

  const auth = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    transporterOptions: { timeout: 10_000, retry: false },
  });
  let token: string | null | undefined;
  try {
    ({ token } = await auth.getAccessToken());
  } catch {
    // Google auth errors can include the signed assertion in request metadata; keep credentials out of logs.
    throw new Error("Google Sheets authentication failed. Check the service account credentials.");
  }
  if (!token) throw new Error("Google Sheets authentication did not return an access token.");

  const submissionId = randomUUID();
  const values = data.chapters.map((chapter, index) => [
    submissionId,
    data.submittedAt,
    data.fullName,
    data.email,
    data.position,
    data.coordinatingBody,
    data.branch,
    index + 1,
    chapter.name,
    chapter.campus,
    chapter.type,
  ]);
  const range = "'Pendataan Komisariat'!A:K";
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append`
  );
  // RAW keeps user-authored values as text, including names beginning with formula characters.
  url.searchParams.set("valueInputOption", "RAW");
  url.searchParams.set("insertDataOption", "INSERT_ROWS");

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ majorDimension: "ROWS", values }),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as {
    updates?: { updatedRows?: number };
  } | null;
  if (!response.ok || result?.updates?.updatedRows !== values.length) {
    throw new Error(`Google Sheets did not save all census rows (HTTP ${response.status}).`);
  }
}
