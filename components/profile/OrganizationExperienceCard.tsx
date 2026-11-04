"use client";

import { IconBuildingCommunity } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  HmiOrganizationExperienceEntry,
  NonHmiOrganizationExperienceEntry,
  OrganizationExperienceEntry,
} from "@/apis/users";
import { entityProfileHref, formatMentionEntityName } from "@/lib/feed-author";
import EditOrganizationExperienceForm from "../forms/EditOrganizationExperienceForm";
import LogoBpl from "../svg/LogoBpl";
import LogoHmi from "../svg/LogoHmi";
import LogoKohati from "../svg/LogoKohati";
import { AddEntryButton, EditEntryButton } from "./ProfileEntryButtons";

interface OrganizationExperienceCardProps {
  entries: OrganizationExperienceEntry[];
  isOwnProfile?: boolean;
}

type OrganizationExperienceType = "hmi" | "non_hmi";

type ExperienceSectionProps = {
  entries: OrganizationExperienceEntry[];
  experienceType: OrganizationExperienceType;
  isOwnProfile?: boolean;
  title: string;
  emptyMessage: string;
};

function HmiExperienceLogo({
  entry,
}: {
  entry: HmiOrganizationExperienceEntry;
}) {
  if (entry.entity_image_url) {
    return (
      <Image
        src={entry.entity_image_url}
        alt={entry.entity_name}
        width={40}
        height={40}
        className="size-full object-contain p-1"
      />
    );
  }

  const entityIdentity = `${entry.entity_name} ${entry.entity_mention_name_normalized}`;
  if (/kohati/i.test(entityIdentity)) {
    return <LogoKohati className="h-8 w-auto max-w-full" aria-hidden="true" />;
  }
  if (/bpl/i.test(entityIdentity)) {
    return <LogoBpl className="size-8" aria-hidden="true" />;
  }
  return <LogoHmi className="h-8 w-auto" aria-hidden="true" />;
}

function hmiExperienceHref(entry: HmiOrganizationExperienceEntry) {
  if (entry.entity_type === "special_body") {
    return `/mentions/${encodeURIComponent(entry.entity_mention_name_normalized)}`;
  }
  return entityProfileHref(entry.entity_type, entry.entity_id);
}

function ExperienceSection({
  entries,
  experienceType,
  isOwnProfile,
  title,
  emptyMessage,
}: ExperienceSectionProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] =
    useState<OrganizationExperienceEntry | null>(null);

  function openForm(entry: OrganizationExperienceEntry | null) {
    setEditTarget(entry);
    setFormOpen(true);
  }

  if (entries.length === 0 && !isOwnProfile) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          {title}
        </h2>
        {isOwnProfile && <AddEntryButton onClick={() => openForm(null)} />}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted-foreground xl:text-[15px]">
            {emptyMessage}
          </p>
        ) : (
          entries.map((entry) => {
            const organizationName =
              entry.experience_type === "hmi"
                ? formatMentionEntityName(
                    entry.entity_type,
                    entry.entity_name,
                    entry.entity_mention_name_normalized
                  )
                : entry.organization_name;
            const entryContent = (
              <>
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface text-primary-foreground">
                  {entry.experience_type === "hmi" ? (
                    <HmiExperienceLogo entry={entry} />
                  ) : (
                    <IconBuildingCommunity className="size-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-heading xl:text-[15px]">
                    {entry.position_title}
                  </p>
                  <p className="text-sm text-muted-foreground xl:text-[15px]">
                    {organizationName}
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
              </>
            );

            return (
              <div key={entry.id} className="flex items-start gap-3">
                {entry.experience_type === "hmi" ? (
                  <Link
                    href={hmiExperienceHref(entry)}
                    aria-label={`Lihat detail ${organizationName}`}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {entryContent}
                  </Link>
                ) : (
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {entryContent}
                  </div>
                )}
                {isOwnProfile && (
                  <EditEntryButton
                    onClick={() => openForm(entry)}
                    label={`Edit ${title.toLowerCase()}`}
                  />
                )}
              </div>
            );
          })
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
          experienceType={experienceType}
          entry={editTarget}
        />
      )}
    </div>
  );
}

export default function OrganizationExperienceCard({
  entries,
  isOwnProfile,
}: OrganizationExperienceCardProps) {
  const hmiEntries = entries.filter(
    (entry): entry is HmiOrganizationExperienceEntry =>
      entry.experience_type === "hmi"
  );
  const nonHmiEntries = entries.filter(
    (entry): entry is NonHmiOrganizationExperienceEntry =>
      entry.experience_type === "non_hmi"
  );

  return (
    <>
      <ExperienceSection
        entries={hmiEntries}
        experienceType="hmi"
        isOwnProfile={isOwnProfile}
        title="Pengalaman Organisasi HMI"
        emptyMessage="Belum ada riwayat organisasi HMI yang ditambahkan."
      />
      <ExperienceSection
        entries={nonHmiEntries}
        experienceType="non_hmi"
        isOwnProfile={isOwnProfile}
        title="Pengalaman Organisasi Lain"
        emptyMessage="Belum ada riwayat organisasi lain yang ditambahkan."
      />
    </>
  );
}
