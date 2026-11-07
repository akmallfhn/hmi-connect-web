"use client";

import { useEffect, useState } from "react";
import type {
  ComposerArticleDraft,
  ComposerEventDraft,
  ComposerNewsDraft,
  ComposerTrainingDraft,
} from "@/components/forms/CreateFeedForms";
import {
  COMPOSE_INTENT_ARTICLE_KEY,
  COMPOSE_INTENT_EVENT_KEY,
  COMPOSE_INTENT_KEY,
  COMPOSE_INTENT_NEWS_KEY,
  COMPOSE_INTENT_PHOTO_KEY,
  COMPOSE_INTENT_TEXT_KEY,
  COMPOSE_INTENT_TRAINING_KEY,
} from "@/lib/constants";

function parseNewsIntent(raw: string | null): ComposerNewsDraft | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as ComposerNewsDraft;
    return parsed.id && parsed.title ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parseArticleIntent(raw: string | null): ComposerArticleDraft | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as ComposerArticleDraft;
    return parsed.id && parsed.title ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parseTrainingIntent(raw: string | null): ComposerTrainingDraft | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as ComposerTrainingDraft;
    return parsed.id && parsed.name && parsed.level ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parseEventIntent(raw: string | null): ComposerEventDraft | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as ComposerEventDraft;
    return parsed.id && parsed.title && parsed.startDate && parsed.endDate ? parsed : undefined;
  } catch {
    return undefined;
  }
}

// Written by the twibbon editor; anything but a JPEG/PNG/WebP data URL is ignored.
function parsePhotoIntent(raw: string | null): File[] | undefined {
  const match = raw && /^data:(image\/(jpeg|png|webp));base64,(.+)$/.exec(raw);
  if (!match) return undefined;
  try {
    const binary = window.atob(match[3]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    const extension = match[2] === "jpeg" ? "jpg" : match[2];
    return [new File([bytes], `twibbon.${extension}`, { type: match[1] })];
  } catch {
    return undefined;
  }
}

export function useFeedComposeIntent() {
  const [signal, setSignal] = useState(0);
  const [news, setNews] = useState<ComposerNewsDraft>();
  const [article, setArticle] = useState<ComposerArticleDraft>();
  const [training, setTraining] = useState<ComposerTrainingDraft>();
  const [event, setEvent] = useState<ComposerEventDraft>();
  const [photos, setPhotos] = useState<File[]>();
  const [text, setText] = useState<string>();

  useEffect(() => {
    function consumeComposeIntent() {
      if (!window.sessionStorage.getItem(COMPOSE_INTENT_KEY)) return;
      window.sessionStorage.removeItem(COMPOSE_INTENT_KEY);

      const read = (key: string) => {
        const value = window.sessionStorage.getItem(key);
        if (value) window.sessionStorage.removeItem(key);
        return value;
      };

      setNews(parseNewsIntent(read(COMPOSE_INTENT_NEWS_KEY)));
      setArticle(parseArticleIntent(read(COMPOSE_INTENT_ARTICLE_KEY)));
      setTraining(parseTrainingIntent(read(COMPOSE_INTENT_TRAINING_KEY)));
      setEvent(parseEventIntent(read(COMPOSE_INTENT_EVENT_KEY)));
      setText(read(COMPOSE_INTENT_TEXT_KEY) ?? undefined);
      setPhotos(parsePhotoIntent(read(COMPOSE_INTENT_PHOTO_KEY)));
      setSignal((previous) => previous + 1);
    }

    consumeComposeIntent();
    window.addEventListener(COMPOSE_INTENT_KEY, consumeComposeIntent);
    return () => window.removeEventListener(COMPOSE_INTENT_KEY, consumeComposeIntent);
  }, []);

  return {
    forceOpenSignal: signal,
    forceOpenNews: news,
    forceOpenArticle: article,
    forceOpenTraining: training,
    forceOpenEvent: event,
    forceOpenText: text,
    forceOpenPhotos: photos,
  };
}
