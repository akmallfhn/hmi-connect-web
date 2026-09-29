"use client";

import { Repeat2 } from "lucide-react";
import { IconRepeat } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { TrainingListEntry } from "@/apis/trainings";
import type { ComposerTrainingDraft } from "@/components/forms/CreateFeedForms";
import Button, {
  type ButtonSize,
  type ButtonVariant,
} from "@/components/buttons/Button";
import {
  COMPOSE_INTENT_KEY,
  COMPOSE_INTENT_TRAINING_KEY,
} from "@/lib/constants";
import { formatOrganizerName } from "@/lib/organizer";

interface RepostTrainingToFeedButtonProps {
  training: TrainingListEntry;
  isSignedIn: boolean;
  className?: string;
  iconOnly?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function RepostTrainingToFeedButton({
  training,
  isSignedIn,
  className,
  iconOnly = false,
  variant = "ghost",
  size = "default",
}: RepostTrainingToFeedButtonProps) {
  const router = useRouter();

  function handleClick() {
    const draft: ComposerTrainingDraft = {
      id: training.id,
      name: training.name,
      level: training.level,
      organizerName: formatOrganizerName(training),
      startDate: training.start_date,
      endDate: training.end_date,
      imageUrl: training.image_url,
    };
    window.sessionStorage.setItem(
      COMPOSE_INTENT_TRAINING_KEY,
      JSON.stringify(draft)
    );
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
    router.push(isSignedIn ? "/" : "/auth/login?redirectTo=%2F");
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      aria-label={`Repost ${training.name} ke feed`}
      title="Repost ke feed"
    >
      {iconOnly ? (
        <IconRepeat className="size-5" stroke={2} />
      ) : (
        <Repeat2 className="size-4" />
      )}
      {iconOnly ? <span className="sr-only">Repost</span> : "Repost"}
    </Button>
  );
}
