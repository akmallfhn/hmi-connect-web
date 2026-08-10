"use client";

import AdminPageTitle from "../common/AdminPageTitle";
import {
  BookOpen,
  CalendarDays,
  ImageOff,
  MapPin,
  PlusCircle,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { TrainingListEntry } from "@/apis/trainings";
import Button from "../buttons/Button";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import TrainingFormSheet from "../forms/TrainingFormSheet";
import EmptyState from "../states/EmptyState";
import {
  TrainingRegistrationLabel,
  TrainingStatusLabel,
} from "../trainings/TrainingLabels";
import { formatDateRange } from "@/lib/time-manipulation";
import { useBranch } from "@/hooks/useBranch";

interface BranchTrainingListPageProps {
  branchId: string;
  trainings: TrainingListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  pageSize: number;
  canManageTrainings: boolean;
}

export default function BranchTrainingListPage({
  branchId,
  trainings,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  pageSize,
  canManageTrainings,
}: BranchTrainingListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { branchName } = useBranch();
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
          <AdminPageTitle
            description={`Kelola pelaksanaan, materi, dan peserta LK2 di Cabang ${branchName}.`}
          >
            Latihan Kader 2
          </AdminPageTitle>
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
        <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
          <EmptyState
            title={
              initialSearch
                ? "Batch LK2 tidak ditemukan"
                : "Belum ada batch LK2"
            }
            description={
              initialSearch
                ? "Coba ubah kata kunci pencarian."
                : "Batch LK2 yang dibuat akan ditampilkan di sini."
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {trainings.map((training) => (
            <Link
              key={training.id}
              href={`/branches/${branchId}/trainings/${training.id}`}
              className="flex gap-4 rounded-xl border border-[#e6e9ef] bg-white p-5 transition hover:border-primary/50 hover:shadow-sm"
            >
              <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-lg bg-[#f5f7fb]">
                {training.image_url ? (
                  <Image
                    src={training.image_url}
                    alt={training.name}
                    width={80}
                    height={100}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[#5f6573]">
                    <ImageOff className="size-5" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="min-w-0 flex flex-col gap-2">
                  <p className="text-base font-semibold text-[#172033]">
                    {training.name}
                  </p>
                  <p className="text-sm text-[#5f6573]">
                    HMI Cabang {training.organizer_name ?? "Cabang"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <TrainingRegistrationLabel
                      isOpen={training.is_registration_open}
                    />
                    <TrainingStatusLabel
                      startDate={training.start_date}
                      endDate={training.end_date}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm text-[#5f6573]">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" />
                    {formatDateRange(training.start_date, training.end_date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" />
                    {training.location_name || "Lokasi belum ditentukan"}
                  </span>
                </div>
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
            {(currentPage - 1) * pageSize + trainings.length} dari {totalData}{" "}
            batch
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
