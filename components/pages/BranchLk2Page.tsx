"use client";

import {
  BookOpen,
  CalendarDays,
  MapPin,
  PlusCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { TrainingListEntry } from "@/apis/trainings";
import Button from "../buttons/Button";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import TrainingFormSheet from "../forms/TrainingFormSheet";
import { TrainingStatusLabel } from "../training/TrainingLabels";
import { formatTrainingDateRange } from "../training/trainingUi";

interface BranchLk2PageProps {
  branchId: string;
  trainings: TrainingListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  pageSize: number;
  canManageTrainings: boolean;
}

export default function BranchLk2Page({
  branchId,
  trainings,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  pageSize,
  canManageTrainings,
}: BranchLk2PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  function pushSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
            Latihan Kader 2
          </h1>
          <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
            Kelola pelaksanaan, materi, dan peserta LK2 di bawah Cabang ini.
          </p>
        </div>
        <div className="flex w-fit shrink-0 flex-wrap gap-2">
          <Link href={`/branches/${branchId}/trainings/guideline`}>
            <Button variant="outline">
              <BookOpen className="size-4" />
              Guideline & Kurikulum
            </Button>
          </Link>
          {canManageTrainings && (
            <Button variant="primary" onClick={() => setShowCreateSheet(true)}>
              <PlusCircle className="size-4" />
              Tambah Batch LK2
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 w-full sm:max-w-sm">
        <Input
          inputId="branch-training-search"
          placeholder="Cari nama batch LK2..."
          icon={<Search className="size-4" />}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      {trainings.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-[#e6e9ef] bg-white px-4 py-16 text-center">
          <CalendarDays className="size-9 text-[#5f6573]" />
          <p className="text-sm font-medium text-[#172033]">
            Tidak ada batch LK2 ditemukan.
          </p>
          {initialSearch && (
            <p className="text-xs text-[#5f6573]">
              Coba ubah kata kunci pencarian.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {trainings.map((training) => (
            <Link
              key={training.id}
              href={`/branches/${branchId}/trainings/${training.id}`}
              className="flex flex-col gap-4 rounded-xl border border-[#e6e9ef] bg-white p-5 transition hover:border-primary/50 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#172033]">
                    {training.name}
                  </p>
                  <p className="mt-1 text-xs text-[#5f6573]">
                    {training.organizer_name ?? "Cabang"}
                  </p>
                </div>
                <TrainingStatusLabel
                  startDate={training.start_date}
                  endDate={training.end_date}
                />
              </div>
              <div className="flex flex-col gap-2 text-sm text-[#5f6573]">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0" />
                  {formatTrainingDateRange(
                    training.start_date,
                    training.end_date
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" />
                  {training.location_name || "Lokasi belum ditentukan"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {trainings.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}-
            {(currentPage - 1) * pageSize + trainings.length} dari {totalData} batch
          </p>
        </div>
      )}

      <TrainingFormSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onSaved={() => {
          setShowCreateSheet(false);
          router.refresh();
        }}
        branchId={branchId}
        training={null}
      />
    </div>
  );
}
