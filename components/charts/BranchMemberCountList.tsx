"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { BranchListEntry } from "@/apis/branches";
import Button from "../buttons/Button";
import Input from "../fields/Input";

const PAGE_SIZE = 3;

interface BranchMemberCountListProps {
  branches: BranchListEntry[];
}

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function formatBranchName(name: string) {
  const normalizedName = name.replace(/^(?:hmi\s+)?cabang\s+/i, "").trim();
  return `Cabang ${normalizedName || name}`;
}

function formatCoordinatingBodyName(name?: string) {
  if (!name) return "Badko tidak tersedia";
  const normalizedName = name.replace(/^(?:hmi\s+)?badko\s+/i, "").trim();
  return `Badko ${normalizedName || name}`;
}

export default function BranchMemberCountList({
  branches,
}: BranchMemberCountListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredBranches = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("id-ID");
    return [...branches]
      .filter(
        (branch) =>
          !query ||
          branch.name.toLocaleLowerCase("id-ID").includes(query) ||
          branch.coordinating_body_name
            ?.toLocaleLowerCase("id-ID")
            .includes(query),
      )
      .sort(
        (a, b) =>
          (a.user_count ?? 0) - (b.user_count ?? 0) ||
          a.name.localeCompare(b.name, "id-ID"),
      );
  }, [branches, searchTerm]);
  const totalData = filteredBranches.length;
  const totalPages = Math.max(1, Math.ceil(totalData / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const firstItem = totalData === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const entries = filteredBranches.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const lastItem = firstItem + entries.length - 1;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#172033]">
            Total Kader tiap Cabang
          </h3>
          <p className="text-sm leading-5 text-[#5f6573]">
            Diurutkan dari jumlah kader aktif paling sedikit
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            inputId="branch-member-count-search"
            type="search"
            placeholder="Cari Cabang"
            aria-label="Cari Cabang"
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
            {searchTerm
              ? "Cabang yang dicari tidak ditemukan."
              : "Belum ada data Cabang."}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex-1 divide-y divide-[#eef0f4]">
          {entries.map((branch) => (
            <div
              key={branch.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Building2 className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  title={formatBranchName(branch.name)}
                  className="truncate text-sm font-semibold text-[#172033]"
                >
                  {formatBranchName(branch.name)}
                </p>
                <p className="mt-0.5 text-xs text-[#5f6573]">
                  {branch.chapter_count !== undefined
                    ? `${formatNumber(branch.chapter_count)} Komisariat`
                    : formatCoordinatingBodyName(branch.coordinating_body_name)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-[#172033]">
                  {formatNumber(branch.user_count ?? 0)}
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
