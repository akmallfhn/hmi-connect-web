import type { BranchTypeEnum } from "./types";

export const CHAPTER_CENSUS_LIMITS = {
  name: 100,
  email: 254,
  position: 100,
  chapterName: 100,
  chapterCampus: 150,
  chapters: 50,
} as const;

export type ChapterCensusEntry = {
  name: string;
  campus: string;
  type: BranchTypeEnum;
};

export type ChapterCensusPayload = {
  fullName: string;
  email: string;
  position: string;
  coordinatingBodyId: string;
  branchId: string;
  chapters: ChapterCensusEntry[];
  // Honeypot: hidden from people, so anything typed here came from a bot.
  website?: string;
};

export type ChapterCensusResult = { ok: true } | { ok: false; message: string };

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
