"use client";

import {
  IconBellCheck,
  IconBellPlus,
  IconCalendarEvent,
  IconPhotoOff,
  IconSchool,
  IconShare,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { TrainingListEntry } from "@/apis/trainings";
import { useTrainingReminder } from "@/hooks/useTrainingReminder";
import { formatOrganizerName } from "@/lib/organizer";
import { formatDate } from "@/lib/time-manipulation";
import Button from "../buttons/Button";
import Label from "../common/Label";
import ShareModal from "../modals/ShareModal";
import LogoHmi from "../svg/LogoHmi";
import RepostTrainingToFeedButton from "./RepostTrainingToFeedButton";
import { TrainingRegistrationLabel } from "./TrainingLabels";

interface PublicTrainingCardProps {
  training: TrainingListEntry;
  isSignedIn: boolean;
}

function TrainingPoster({ training }: { training: TrainingListEntry }) {
  return training.image_url ? (
    <Image
      src={training.image_url}
      alt={`Poster ${training.name}`}
      fill
      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 390px"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="flex size-full items-center justify-center text-white/70">
      <IconPhotoOff className="size-8" stroke={1.8} />
    </div>
  );
}

export default function PublicTrainingCard({
  training,
  isSignedIn,
}: PublicTrainingCardProps) {
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

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#dbe3ef] bg-white transition-colors hover:border-primary/60 focus-within:border-primary">
        <Link
          href={`/trainings/${training.id}`}
          className="block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#0b6970,#159fa2)]">
            <TrainingPoster training={training} />
            <div className="pointer-events-none absolute inset-0 bg-black/15" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5">
              <Label
                variant="gray"
                icon={<IconCalendarEvent className="size-3.5" stroke={2} />}
              >
                {formatDate(training.start_date)}
              </Label>
              <Label
                variant="gray"
                icon={<IconSchool className="size-3.5" stroke={2} />}
              >
                {training.level}
              </Label>
            </div>
          </div>

          <div className="min-h-[148px] flex flex-col gap-3 px-4 pb-4 pt-4">
            <h2 className="font-stack-sans-headline line-clamp-2 text-lg font-medium leading-6 text-[#172033]">
              {training.name}
            </h2>

            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft ring-1 ring-[#dbe3ef]">
                <LogoHmi className="h-5 w-auto" aria-hidden="true" />
              </span>
              <span className="truncate text-sm font-medium text-[#5f6573] lg:text-[15px]">
                {organizerName}
              </span>
            </div>
            <TrainingRegistrationLabel isOpen={training.is_registration_open} />
          </div>
        </Link>

        <div className="flex items-center gap-2 border-t border-[#edf0f3] px-4 py-3">
          <Link
            href={`/trainings/${training.id}`}
            className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white transition hover:bg-[#128488] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Lihat detail
          </Link>
          <Button
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
          </Button>
          <RepostTrainingToFeedButton
            training={training}
            isSignedIn={isSignedIn}
            iconOnly
            variant="outline"
            size="icon"
          />
          <Button
            onClick={() => setShareOpen(true)}
            aria-label={`Bagikan ${training.name}`}
            title="Bagikan"
            variant="outline"
            size="icon"
          >
            <IconShare className="size-5" />
          </Button>
        </div>
      </article>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={eventUrl}
        text={`Lihat ${training.name}, agenda ${training.level} dari HMI Connect`}
      />
    </>
  );
}
