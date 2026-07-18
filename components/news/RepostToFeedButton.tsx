"use client";

import { Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import type { NewsArticle } from "@/apis/news";
import { COMPOSE_INTENT_KEY, COMPOSE_INTENT_URL_KEY } from "@/lib/constants";
import Button, { type ButtonVariant } from "../buttons/Button";

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
    // The card itself is a link to the source article — stop that navigation, this button
    // does something else (open the composer at home with the article's URL pre-filled).
    event.preventDefault();
    event.stopPropagation();

    window.sessionStorage.setItem(COMPOSE_INTENT_URL_KEY, article.source_url);
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
