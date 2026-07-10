"use client";

import { BriefcaseBusiness, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrganizationExperienceEntry } from "@/apis/users";
import Button from "../buttons/Button";
import EditOrganizationExperienceForm from "../forms/EditOrganizationExperienceForm";

interface OrganizationExperienceCardProps {
  userId?: string;
  entries: OrganizationExperienceEntry[];
  isOwnProfile?: boolean;
}

export default function OrganizationExperienceCard({
  userId,
  entries,
  isOwnProfile,
}: OrganizationExperienceCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 shadow-sm lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#172033]">
          Pengalaman Organisasi
        </h2>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#dbe3ef] px-4 py-5 text-sm text-[#5f6573]">
            Belum ada pengalaman organisasi yang ditambahkan.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <BriefcaseBusiness className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#172033]">
                  {entry.position_title}
                </p>
                <p className="text-sm text-[#5f6573]">
                  {entry.organization_name}
                </p>
                <p className="text-xs text-[#5f6573]">
                  {entry.start_year} – {entry.end_year ?? "Sekarang"}
                </p>
                {entry.description && (
                  <p className="mt-1 text-sm leading-relaxed text-[#5f6573]">
                    {entry.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isOwnProfile && (
        <EditOrganizationExperienceForm
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSaved={() => {
            setIsEditOpen(false);
            router.refresh();
          }}
          userId={userId}
          entries={entries}
        />
      )}
    </div>
  );
}
