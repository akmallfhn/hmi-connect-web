"use client";

import { Pencil, Repeat2, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArticleDetail } from "@/apis/articles";
import Button from "@/components/buttons/Button";
import ShareModal from "@/components/modals/ShareModal";
import type { ComposerArticleDraft } from "@/components/forms/CreateFeedForms";
import {
  COMPOSE_INTENT_ARTICLE_KEY,
  COMPOSE_INTENT_KEY,
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

  // Same hand-off RepostToFeedButton uses for news, just carrying an article instead.
  function handleShareToFeed() {
    if (!isSignedIn) {
      router.push(`/auth/login?redirectTo=${articlePath}`);
      return;
    }

    const draft: ComposerArticleDraft = {
      id: article.id,
      title: article.title,
      slugUrl: article.slug_url,
      imageUrl: article.image_url,
      description: article.description ?? undefined,
      categoryName: article.category_name,
      authorName: article.author_name,
      authorAvatar: article.author_avatar,
    };
    window.sessionStorage.setItem(
      COMPOSE_INTENT_ARTICLE_KEY,
      JSON.stringify(draft)
    );
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
    router.push("/");
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
          onClick={handleShareToFeed}
          aria-label="Bagikan ke feed"
          title="Bagikan ke feed"
          className={ACTION_CLASS}
        >
          <Repeat2 className="size-4" />
        </Button>

        <Button
          type="button"
          variant="secondarySoft"
          size="icon"
          onClick={() => setShareOpen(true)}
          aria-label="Bagikan artikel"
          title="Bagikan artikel"
          className={ACTION_CLASS}
        >
          <Share2 className="size-4" />
        </Button>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        text={`Baca artikel ini di HMI Connect: ${article.title}`}
      />
    </>
  );
}
