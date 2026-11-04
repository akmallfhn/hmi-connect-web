"use client";

import { IconBook2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicationEntry } from "@/apis/users";
import EditPublicationForm from "../forms/EditPublicationForm";
import { AddEntryButton, EditEntryButton } from "./ProfileEntryButtons";

interface PublicationCardProps {
  entries: PublicationEntry[];
  isOwnProfile?: boolean;
}

export default function PublicationCard({
  entries,
  isOwnProfile,
}: PublicationCardProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PublicationEntry | null>(null);

  function openForm(entry: PublicationEntry | null) {
    setEditTarget(entry);
    setFormOpen(true);
  }

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          Publikasi
        </h2>
        {isOwnProfile && (
          <AddEntryButton onClick={() => openForm(null)} />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted-foreground xl:text-[15px]">
            Belum ada publikasi yang ditambahkan.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-secondary-foreground">
                <IconBook2 className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-heading hover:text-primary-foreground hover:underline xl:text-[15px]"
                  >
                    {entry.title}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-heading xl:text-[15px]">
                    {entry.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground xl:text-[15px]">
                  {entry.publisher}
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
                  label="Edit publikasi"
                />
              )}
            </div>
          ))
        )}
      </div>

      {isOwnProfile && (
        <EditPublicationForm
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
