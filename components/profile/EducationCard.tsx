"use client";

import { GraduationCap, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Institution } from "@/apis/institutions";
import type { EducationHistoryEntry } from "@/apis/users";
import { DEGREE_LABELS } from "@/lib/education";
import { institutionHref } from "@/lib/institution";
import Button from "../buttons/Button";
import EditEducationForm from "../forms/EditEducationForm";

interface EducationCardProps {
  entries: EducationHistoryEntry[];
  institutions: Institution[];
  isOwnProfile?: boolean;
}

export default function EducationCard({
  entries,
  institutions,
  isOwnProfile,
}: EducationCardProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EducationHistoryEntry | null>(
    null
  );

  if (entries.length === 0 && !isOwnProfile) return null;

  function openForm(entry: EducationHistoryEntry | null) {
    setEditTarget(entry);
    setFormOpen(true);
  }

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          Pendidikan
        </h2>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" onClick={() => openForm(null)}>
            <Plus className="size-3.5" />
            Tambah
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Belum ada riwayat pendidikan.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-xl border border-border p-3 transition hover:bg-surface-muted"
            >
              <Link
                href={institutionHref(entry.institution_id, entry.institution_slug)}
                className="flex min-w-0 flex-1 items-start gap-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface text-primary-foreground">
                  {entry.image_url ? (
                    <Image
                      src={entry.image_url}
                      alt={entry.institution_name}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  ) : (
                    <GraduationCap className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading xl:text-[15px]">
                    {entry.institution_name}
                  </p>
                  <p className="text-sm text-muted-foreground xl:text-[15px]">
                    {DEGREE_LABELS[entry.degree]}
                    {entry.major ? ` • ${entry.major}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground xl:text-[13px]">
                    {entry.start_year} – {entry.end_year ?? "Sekarang"}
                  </p>
                </div>
              </Link>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openForm(entry)}
                  aria-label={`Edit pendidikan ${entry.institution_name}`}
                  className="shrink-0"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOwnProfile && (
        <EditEducationForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            router.refresh();
          }}
          entry={editTarget}
          institutions={institutions}
        />
      )}
    </div>
  );
}
