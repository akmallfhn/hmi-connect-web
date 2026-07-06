"use client";

import { GraduationCap, Pencil } from "lucide-react";
import Image from "next/image";
import type { Degree } from "@/lib/types";
import type { EducationHistoryEntry } from "@/apis/users";
import { useProfileEdit } from "../modals/AppModals";

const DEGREE_LABELS: Record<Degree, string> = {
  diploma_ahli_pratama: "Diploma (Ahli Pratama)",
  diploma_ahli_muda: "Diploma (Ahli Muda)",
  diploma_ahli_madya: "Diploma (Ahli Madya)",
  sarjana: "Sarjana",
  magister: "Magister",
  doktor: "Doktor",
};

interface EducationCardProps {
  entries: EducationHistoryEntry[];
  isOwnProfile?: boolean;
}

export default function EducationCard({
  entries,
  isOwnProfile,
}: EducationCardProps) {
  const { openModal } = useProfileEdit();

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#172033]">Pendidikan</h2>
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => openModal("education")}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary-soft"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6e9ef] bg-white text-primary">
              {entry.image_url ? (
                <Image
                  src={entry.image_url}
                  alt={entry.institution_name}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <GraduationCap className="size-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#172033]">
                {entry.institution_name}
              </p>
              <p className="text-sm text-[#5f6573]">
                {DEGREE_LABELS[entry.degree]} • {entry.major}
              </p>
              <p className="text-xs text-[#5f6573]">
                {entry.start_year} – {entry.end_year ?? "Sekarang"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
