"use client";

import { BookOpen, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicationEntry } from "@/apis/users";
import Button from "../buttons/Button";
import EditPublicationForm from "../forms/EditPublicationForm";

interface PublicationCardProps {
  userId?: string;
  entries: PublicationEntry[];
  isOwnProfile?: boolean;
}

export default function PublicationCard({
  userId,
  entries,
  isOwnProfile,
}: PublicationCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          Publikasi
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
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted-foreground xl:text-[15px]">
            Belum ada publikasi yang ditambahkan.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary-foreground">
                <BookOpen className="size-5" />
              </div>
              <div className="min-w-0">
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
            </div>
          ))
        )}
      </div>

      {isOwnProfile && (
        <EditPublicationForm
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
