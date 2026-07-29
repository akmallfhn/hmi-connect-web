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
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#172033]">Publikasi</h2>
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
            Belum ada publikasi yang ditambahkan.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                <BookOpen className="size-5" />
              </div>
              <div className="min-w-0">
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#172033] hover:text-primary hover:underline"
                  >
                    {entry.title}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-[#172033]">{entry.title}</p>
                )}
                <p className="text-sm text-[#5f6573]">{entry.publisher}</p>
                <p className="text-xs text-[#5f6573]">{entry.year}</p>
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
