"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Factory, Search } from "lucide-react";
import type { ChapterListEntry } from "@/apis/chapters";
import Button from "../buttons/Button";
import Input from "../fields/Input";

const PAGE_SIZE = 3;

interface ChapterMemberCountListProps {
  chapters: ChapterListEntry[];
}

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function formatChapterName(name: string) {
  const normalizedName = name.replace(/^(?:hmi\s+)?komisariat\s+/i, "").trim();
  return `Komisariat ${normalizedName || name}`;
}

function getChapterMeta(chapter: ChapterListEntry) {
  if (chapter.institution_name) return chapter.institution_name;
  if (chapter.coordinating_chapter_name) {
    const name = chapter.coordinating_chapter_name
      .replace(/^(?:hmi\s+)?korkom\s+/i, "")
      .trim();
    return `Korkom ${name || chapter.coordinating_chapter_name}`;
  }
  const branchName = chapter.branch_name
    .replace(/^(?:hmi\s+)?cabang\s+/i, "")
    .trim();
  return `Cabang ${branchName || chapter.branch_name}`;
}

export default function ChapterMemberCountList({
  chapters,
}: ChapterMemberCountListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredChapters = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("id-ID");
    return [...chapters]
      .filter(
        (chapter) =>
          !query ||
          chapter.name.toLocaleLowerCase("id-ID").includes(query) ||
          chapter.institution_name
            ?.toLocaleLowerCase("id-ID")
            .includes(query) ||
          chapter.coordinating_chapter_name
            ?.toLocaleLowerCase("id-ID")
            .includes(query) ||
          chapter.branch_name.toLocaleLowerCase("id-ID").includes(query),
      )
      .sort(
        (a, b) =>
          (a.user_count ?? 0) - (b.user_count ?? 0) ||
          a.name.localeCompare(b.name, "id-ID"),
      );
  }, [chapters, searchTerm]);
  const totalData = filteredChapters.length;
  const totalPages = Math.max(1, Math.ceil(totalData / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const firstItem = totalData === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const entries = filteredChapters.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const lastItem = firstItem + entries.length - 1;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#172033]">
            Total Kader tiap Komisariat
          </h3>
          <p className="text-sm leading-5 text-[#5f6573]">
            Diurutkan dari jumlah kader aktif paling sedikit
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            inputId="chapter-member-count-search"
            type="search"
            placeholder="Cari Komisariat"
            aria-label="Cari Komisariat"
            value={searchTerm}
            icon={<Search className="size-4" />}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="text-sm"
          />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex min-h-40 flex-1 items-center justify-center text-center">
          <p className="text-sm text-[#5f6573]">
            {searchTerm.trim()
              ? "Komisariat yang dicari tidak ditemukan."
              : "Belum ada data Komisariat."}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex-1 divide-y divide-[#eef0f4]">
          {entries.map((chapter) => (
            <div
              key={chapter.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Factory className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  title={formatChapterName(chapter.name)}
                  className="truncate text-sm font-semibold text-[#172033]"
                >
                  {formatChapterName(chapter.name)}
                </p>
                <p
                  title={getChapterMeta(chapter)}
                  className="mt-0.5 truncate text-xs text-[#5f6573]"
                >
                  {getChapterMeta(chapter)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-[#172033]">
                  {formatNumber(chapter.user_count ?? 0)}
                </p>
                <p className="text-xs text-[#5f6573]">Kader Aktif</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f4] pt-4">
          <p className="text-xs text-[#5f6573]">
            {firstItem}–{lastItem} dari {formatNumber(totalData)} data
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              aria-label="Halaman sebelumnya"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setCurrentPage(page - 1)}
            >
              <ChevronLeft className="size-3.5" /> Prev
            </Button>
            <span className="min-w-14 text-center text-xs font-semibold text-[#172033]">
              {page} / {totalPages}
            </span>
            <Button
              aria-label="Halaman selanjutnya"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setCurrentPage(page + 1)}
            >
              Next <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
