"use client";

import { IconAward } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HonorAwardEntry } from "@/apis/users";
import EditHonorAwardForm from "../forms/EditHonorAwardForm";
import { AddEntryButton, EditEntryButton } from "./ProfileEntryButtons";

interface HonorAwardCardProps {
  entries: HonorAwardEntry[];
  isOwnProfile?: boolean;
}

export default function HonorAwardCard({
  entries,
  isOwnProfile,
}: HonorAwardCardProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HonorAwardEntry | null>(null);

  function openForm(entry: HonorAwardEntry | null) {
    setEditTarget(entry);
    setFormOpen(true);
  }

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          Honor & Penghargaan
        </h2>
        {isOwnProfile && (
          <AddEntryButton onClick={() => openForm(null)} />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted-foreground xl:text-[15px]">
            Belum ada honor atau penghargaan yang ditambahkan.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-secondary-foreground">
                <IconAward className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading xl:text-[15px]">
                  {entry.title}
                </p>
                <p className="text-sm text-muted-foreground xl:text-[15px]">
                  {entry.issuer}
                </p>
                <p className="text-xs text-muted-foreground xl:text-[13px]">
                  {entry.year}
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
                  label="Edit penghargaan"
                />
              )}
            </div>
          ))
        )}
      </div>

      {isOwnProfile && (
        <EditHonorAwardForm
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
