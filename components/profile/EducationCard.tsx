"use client";

import { GraduationCap, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Institution } from "@/apis/institutions";
import type { EducationHistoryEntry } from "@/apis/users";
import { DEGREE_LABELS } from "@/lib/education";
import Button from "../buttons/Button";
import EditEducationForm from "../forms/EditEducationForm";

interface EducationCardProps {
  userId?: string;
  entries: EducationHistoryEntry[];
  institutions: Institution[];
  isOwnProfile?: boolean;
}

export default function EducationCard({
  userId,
  entries,
  institutions,
  isOwnProfile,
}: EducationCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#172033]">Pendidikan</h2>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
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

      {isOwnProfile && (
        <EditEducationForm
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSaved={() => {
            setIsEditOpen(false);
            router.refresh();
          }}
          userId={userId}
          entries={entries}
          institutions={institutions}
        />
      )}
    </div>
  );
}
