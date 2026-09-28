"use client";

import { Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TrainingListEntry } from "@/apis/trainings";
import type { ComposerTrainingDraft } from "@/components/forms/CreateFeedForms";
import {
  COMPOSE_INTENT_KEY,
  COMPOSE_INTENT_TRAINING_KEY,
} from "@/lib/constants";

interface RepostTrainingToFeedButtonProps {
  training: TrainingListEntry;
  isSignedIn: boolean;
  className?: string;
}

export default function RepostTrainingToFeedButton({
  training,
  isSignedIn,
  className,
}: RepostTrainingToFeedButtonProps) {
  const router = useRouter();

  function handleClick() {
    const draft: ComposerTrainingDraft = {
      id: training.id,
      name: training.name,
      level: training.level,
      startDate: training.start_date,
      endDate: training.end_date,
      imageUrl: training.image_url,
    };
    window.sessionStorage.setItem(
      COMPOSE_INTENT_TRAINING_KEY,
      JSON.stringify(draft),
    );
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
    router.push(isSignedIn ? "/" : "/auth/login?redirectTo=%2F");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={`Repost ${training.name} ke feed`}
    >
      <Repeat2 className="size-4" />
      Repost
    </button>
  );
}
