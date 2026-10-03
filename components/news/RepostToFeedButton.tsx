"use client";

import { Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import type { NewsArticle } from "@/apis/news";
import { COMPOSE_INTENT_KEY, COMPOSE_INTENT_NEWS_KEY } from "@/lib/constants";
import Button from "../buttons/Button";
import type { ComposerNewsDraft } from "../forms/CreateFeedForms";

interface RepostToFeedButtonProps {
  article: NewsArticle;
  className?: string;
}

export default function RepostToFeedButton({
  article,
  className,
}: RepostToFeedButtonProps) {
  const router = useRouter();

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
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={`Repost berita ${article.title} ke feed`}
      title="Repost ke feed"
      className={`size-8 shrink-0 rounded-full text-[#5f6573] hover:bg-[#f5f7fb] ${className ?? ""}`}
    >
      <Repeat2 className="size-4" />
    </Button>
  );
}
