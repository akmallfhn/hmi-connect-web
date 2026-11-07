"use client";

import { Pencil } from "lucide-react";
import { IconShare2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArticleDetail } from "@/apis/articles";
import Button from "@/components/buttons/Button";
import ArticleShareModal from "./ArticleShareModal";
import { articleComposeDraft } from "@/lib/article-compose-draft";
import { openFeedComposerWithAttachment } from "@/lib/feed-compose-intent";
import {
  COMPOSE_INTENT_ARTICLE_KEY,
} from "@/lib/constants";

const ACTION_CLASS = "size-9 shrink-0 rounded-lg";

interface ArticleDetailActionsProps {
  article: ArticleDetail;
  canEdit: boolean;
  isSignedIn: boolean;
}

export default function ArticleDetailActions({
  article,
  canEdit,
  isSignedIn,
}: ArticleDetailActionsProps) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const articlePath = `/articles/${article.slug_url || "artikel"}/${article.id}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${articlePath}`
      : "";

  function handleShareToFeed() {
    openFeedComposerWithAttachment(
      COMPOSE_INTENT_ARTICLE_KEY,
      articleComposeDraft(article),
      router.push,
      isSignedIn,
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {canEdit && (
          <Button
            type="button"
            variant="secondarySoft"
            size="icon"
            onClick={() => router.push(`${articlePath}/edit`)}
            aria-label="Edit artikel"
            title="Edit artikel"
            className={ACTION_CLASS}
          >
            <Pencil className="size-4" />
          </Button>
        )}

        <Button
          type="button"
          variant="secondarySoft"
          size="icon"
          onClick={() => setShareOpen(true)}
          aria-label="Bagikan artikel"
          title="Bagikan artikel"
          className={ACTION_CLASS}
        >
          <IconShare2 className="size-4" />
        </Button>
      </div>

      <ArticleShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        article={article}
        url={shareUrl}
        onShareToFeed={handleShareToFeed}
      />
    </>
  );
}
