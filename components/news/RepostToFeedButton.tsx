"use client";

import { Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import type { NewsArticle } from "@/apis/news";
import { COMPOSE_INTENT_KEY, COMPOSE_INTENT_NEWS_KEY } from "@/lib/constants";
import Button, { type ButtonVariant } from "../buttons/Button";
import type { ComposerNewsDraft } from "../forms/CreateFeedForms";

interface RepostToFeedButtonProps {
  article: NewsArticle;
  className?: string;
  variant?: ButtonVariant;
  /** "sm" (default) sits inline in a meta row; "lg" is for the heroMain corner badge. */
  size?: "sm" | "lg";
}

const DIMENSIONS: Record<"sm" | "lg", { button: string; icon: string }> = {
  sm: { button: "size-7", icon: "size-4" },
  lg: { button: "size-11", icon: "size-5" },
};

export default function RepostToFeedButton({
  article,
  className,
  variant = "ghost",
  size = "sm",
}: RepostToFeedButtonProps) {
  const router = useRouter();
  const { button: buttonSize, icon: iconSize } = DIMENSIONS[size];

  function handleClick(event: MouseEvent) {
    // The whole card links out to the source — this button opens the composer instead.
    event.preventDefault();
    event.stopPropagation();

    const draft: ComposerNewsDraft = {
      id: article.id,
      title: article.title,
      sourceUrl: article.source_url,
      sourceName: article.source_name,
      sourceLogoUrl: article.source_logo_url,
      imageUrl: article.image_url,
      summary: article.summary,
    };
    window.sessionStorage.setItem(COMPOSE_INTENT_NEWS_KEY, JSON.stringify(draft));
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
    router.push("/");
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      onClick={handleClick}
      aria-label="Bagikan ke feed"
      className={`${buttonSize} shrink-0 rounded-full ${variant === "ghost" ? "hover:bg-black/5" : ""} ${className ?? ""}`}
    >
      <Repeat2 className={iconSize} />
    </Button>
  );
}
