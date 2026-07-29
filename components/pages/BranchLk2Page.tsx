"use client";

import { BookOpen, CalendarDays, MapPin, PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Button from "../buttons/Button";
import { Lk2BatchStatusLabel } from "../lk2/Lk2Labels";
import Lk2BatchFormSheet from "../lk2/Lk2BatchFormSheet";
import { LK2_BATCHES } from "../lk2/mockData";

interface BranchLk2PageProps {
  branchId: string;
}

function formatDateRange(startDate: string, endDate: string) {
  const format = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return `${format(startDate)} – ${format(endDate)}`;
}

// Frontend-only prototype — LK2_BATCHES is static mock data, no real API behind this yet.
export default function BranchLk2Page({ branchId }: BranchLk2PageProps) {
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
            Latihan Kader 2
          </h1>
          <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
            Kelola batch dan kelulusan LK2 di bawah Cabang ini.
          </p>
        </div>
        <div className="flex w-fit shrink-0 gap-2">
          <Link href={`/branches/${branchId}/lk2/guideline`}>
            <Button variant="outline">
              <BookOpen className="size-4" />
              Guideline & Kurikulum
            </Button>
          </Link>
          <Button variant="primary" onClick={() => setShowCreateSheet(true)}>
            <PlusCircle className="size-4" />
            Tambah Batch LK2
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {LK2_BATCHES.map((batch) => (
          <Link
            key={batch.id}
            href={`/branches/${branchId}/lk2/${batch.id}`}
            className="flex flex-col gap-3 rounded-xl border border-[#e6e9ef] bg-white p-5 transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-semibold text-[#172033]">{batch.name}</p>
              <Lk2BatchStatusLabel status={batch.status} />
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-[#5f6573]">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0" />
                {formatDateRange(batch.startDate, batch.endDate)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {batch.location}
              </span>
              <span className="flex items-center gap-2">
                <Users className="size-4 shrink-0" />
                {batch.participants.length} Peserta · MOT: {batch.mot}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Lk2BatchFormSheet open={showCreateSheet} onClose={() => setShowCreateSheet(false)} />
    </div>
  );
}
