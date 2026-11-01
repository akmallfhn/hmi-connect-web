"use client";

import { BriefcaseBusiness } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrganizationExperienceEntry } from "@/apis/users";
import EditOrganizationExperienceForm from "../forms/EditOrganizationExperienceForm";
import { AddEntryButton, EditEntryButton } from "./ProfileEntryButtons";

interface OrganizationExperienceCardProps {
  entries: OrganizationExperienceEntry[];
  isOwnProfile?: boolean;
}

export default function OrganizationExperienceCard({
  entries,
  isOwnProfile,
}: OrganizationExperienceCardProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OrganizationExperienceEntry | null>(null);

  function openForm(entry: OrganizationExperienceEntry | null) {
    setEditTarget(entry);
    setFormOpen(true);
  }

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          Pengalaman Organisasi
        </h2>
        {isOwnProfile && (
          <AddEntryButton onClick={() => openForm(null)} />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted-foreground xl:text-[15px]">
            Belum ada pengalaman organisasi yang ditambahkan.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-foreground">
                <BriefcaseBusiness className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading xl:text-[15px]">
                  {entry.position_title}
                </p>
                <p className="text-sm text-muted-foreground xl:text-[15px]">
                  {entry.organization_name}
                </p>
                <p className="text-xs text-muted-foreground xl:text-[13px]">
                  {entry.start_year} – {entry.end_year ?? "Sekarang"}
                </p>
                {entry.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground xl:text-[15px]">
                    {entry.description}
                  </p>
                )}
              </div>
              {isOwnProfile && (
                <EditEntryButton
                  onClick={() => openForm(entry)}
                  label="Edit pengalaman organisasi"
                />
              )}
            </div>
          ))
        )}
      </div>

      {isOwnProfile && (
        <EditOrganizationExperienceForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            router.refresh();
          }}
          entry={editTarget}
        />
      )}
    </div>
  );
}
