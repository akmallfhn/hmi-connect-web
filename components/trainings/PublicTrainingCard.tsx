"use client";

import {
  IconBellCheck,
  IconBellPlus,
  IconCalendarEvent,
  IconMapPin,
  IconPhotoOff,
  IconSchool,
  IconShare2,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrainingListEntry } from "@/apis/trainings";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import { MANAGE_TRAININGS_HREF } from "@/lib/access";
import { openFeedComposerWithAttachment, trainingComposeIntent } from "@/lib/feed-compose-intent";
import { formatOrganizerName } from "@/lib/organizer";
import { formatDate } from "@/lib/time-manipulation";
import Button from "../buttons/Button";
import Label from "../common/Label";
import ShareModal from "../modals/ShareModal";
import LogoHmi from "../svg/LogoHmi";
import { TrainingRegistrationLabel } from "./TrainingLabels";

interface PublicTrainingCardProps {
  training: TrainingListEntry;
  isSignedIn: boolean;
  manage?: boolean;
  compactMobile?: boolean;
  showActions?: boolean;
}

function TrainingPoster({ training, compactMobile }: { training: TrainingListEntry; compactMobile: boolean }) {
  return training.image_url ? (
    <Image
      src={training.image_url}
      alt={`Poster ${training.name}`}
      fill
      sizes={compactMobile ? "(max-width: 639px) 80px, (max-width: 1279px) 50vw, 390px" : "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 390px"}
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="flex size-full items-center justify-center text-on-dark/70">
      <IconPhotoOff className="size-8" stroke={1.8} />
    </div>
  );
}

export default function PublicTrainingCard({
  training,
  isSignedIn,
  manage = false,
  compactMobile = false,
  showActions = true,
}: PublicTrainingCardProps) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const {
    active: reminded,
    saving: savingReminder,
    toggle: toggleReminder,
  } = useTrainingReminder({
    trainingId: training.id,
    initialActive: training.is_reminder_active,
    isSignedIn,
  });

  const eventUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/trainings/${training.id}`;
  const organizerName = formatOrganizerName(training);
  const detailHref = manage ? `${MANAGE_TRAININGS_HREF}/${training.id}` : `/trainings/${training.id}`;

  return (
    <>
      <article className={`group flex h-full min-w-0 flex-col overflow-hidden transition-colors hover:border-primary/60 focus-within:border-primary ${compactMobile ? "sm:rounded-2xl sm:border sm:border-border-strong sm:bg-surface" : "rounded-2xl border border-border-strong bg-surface"}`}>
        <Link
          href={detailHref}
          className={`min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${compactMobile ? "flex gap-3 sm:block" : "block"}`}
        >
          <div className={`relative overflow-hidden bg-linear-to-br from-brand-deep to-primary ${compactMobile ? "aspect-[4/5] w-20 shrink-0 self-start rounded-lg sm:aspect-[16/9] sm:w-auto sm:rounded-none" : "aspect-[16/9]"}`}>
            <TrainingPoster training={training} compactMobile={compactMobile} />
            <div className={`pointer-events-none absolute inset-0 bg-media-backdrop/15 ${compactMobile ? "hidden sm:block" : ""}`} />
            <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-media-backdrop/80 to-transparent ${compactMobile ? "hidden sm:block" : ""}`} />
            <div className={`absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5 ${compactMobile ? "hidden sm:flex" : ""}`}>
              {!compactMobile && (
                <Label
                  variant="gray"
                  icon={<IconCalendarEvent className="size-3.5" stroke={2} />}
                >
                  {formatDate(training.start_date)}
                </Label>
              )}
              <Label
                variant="gray"
                icon={<IconSchool className="size-3.5" stroke={2} />}
              >
                {training.level}
              </Label>
            </div>
          </div>

          <div className={`flex min-w-0 flex-col ${compactMobile ? "flex-1 gap-1.5 p-0 sm:min-h-[148px] sm:gap-3 sm:px-4 sm:pb-4 sm:pt-4" : "min-h-[148px] gap-3 px-4 pb-4 pt-4"}`}>
            <h2 className={`font-stack-sans-headline line-clamp-2 font-medium text-heading ${compactMobile ? "text-sm leading-5 sm:text-lg sm:leading-6" : "text-lg leading-6"}`}>
              {training.name}
            </h2>

            <div className={`min-w-0 items-center gap-2 ${compactMobile ? "hidden sm:flex" : "flex"}`}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft ring-1 ring-border-strong">
                <LogoHmi className="h-5 w-auto" aria-hidden="true" />
              </span>
              <span className="truncate text-sm font-medium text-muted-foreground lg:text-[15px]">
                {organizerName}
              </span>
            </div>
            {compactMobile && (
              <div className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground sm:text-sm">
                <span className="flex min-w-0 items-center gap-1.5">
                  <IconCalendarEvent className="size-4 shrink-0" stroke={2} />
                  <span className="truncate">{formatDate(training.start_date)}</span>
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <IconMapPin className="size-4 shrink-0" stroke={2} />
                  <span className="truncate" title={training.location_name || "Lokasi menyusul"}>
                    {training.location_name || "Lokasi menyusul"}
                  </span>
                </span>
              </div>
            )}
            {typeof training.is_registration_open === "boolean" && (
              <TrainingRegistrationLabel isOpen={training.is_registration_open} className={compactMobile ? "max-w-full" : undefined} />
            )}
          </div>
        </Link>

        {showActions && (
          <div className="flex items-center gap-2 border-t border-border px-4 py-3">
            <Link
              href={detailHref}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary-action transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {manage ? "Kelola training" : "Lihat detail"}
            </Link>
            {!manage && <Button
              onClick={toggleReminder}
              disabled={savingReminder}
              aria-label={
                reminded
                  ? `Batalkan pengingat ${training.name}`
                  : `Ingatkan saya tentang ${training.name}`
              }
              aria-pressed={reminded}
              title={reminded ? "Batalkan pengingat" : "Ingatkan saya"}
              variant={reminded ? "soft" : "outline"}
              size="icon"
            >
              {reminded ? (
                <IconBellCheck className="size-5" />
              ) : (
                <IconBellPlus className="size-5" />
              )}
            </Button>}
            <Button
              onClick={() => setShareOpen(true)}
              aria-label={`Bagikan ${training.name}`}
              title="Bagikan"
              variant="outline"
              size="icon"
            >
              <IconShare2 className="size-5" />
            </Button>
          </div>
        )}
      </article>
      {showActions && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          url={eventUrl}
          text={`Lihat ${training.name}, agenda ${training.level} dari HMI Connect`}
          onShareToFeed={() => {
            const { key, draft } = trainingComposeIntent(training);
            openFeedComposerWithAttachment(key, draft, router.push, isSignedIn);
          }}
        />
      )}
    </>
  );
}
