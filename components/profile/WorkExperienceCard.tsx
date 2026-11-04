"use client";

import { IconBriefcase } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkExperienceEntry } from "@/apis/users";
import EditWorkExperienceForm from "../forms/EditWorkExperienceForm";
import { AddEntryButton, EditEntryButton } from "./ProfileEntryButtons";

interface WorkExperienceCardProps {
  entries: WorkExperienceEntry[];
  isOwnProfile?: boolean;
}

export default function WorkExperienceCard({
  entries,
  isOwnProfile,
}: WorkExperienceCardProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkExperienceEntry | null>(null);

  function openForm(entry: WorkExperienceEntry | null) {
    setEditTarget(entry);
    setFormOpen(true);
  }

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          Pengalaman Kerja
        </h2>
        {isOwnProfile && (
          <AddEntryButton onClick={() => openForm(null)} />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted-foreground xl:text-[15px]">
            Belum ada pengalaman kerja yang ditambahkan.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary-foreground">
                <IconBriefcase className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading xl:text-[15px]">
                  {entry.position_title}
                </p>
                <p className="text-sm text-muted-foreground xl:text-[15px]">
                  {entry.company_name}
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
                  label="Edit pengalaman kerja"
                />
              )}
            </div>
          ))
        )}
      </div>

      {isOwnProfile && (
        <EditWorkExperienceForm
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
