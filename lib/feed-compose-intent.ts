import type { EventListEntry } from "@/apis/events";
import type { NewsArticle } from "@/apis/news";
import type { TrainingListEntry } from "@/apis/trainings";
import type {
  ComposerEventDraft,
  ComposerNewsDraft,
  ComposerTrainingDraft,
} from "@/components/forms/CreateFeedForms";
import {
  COMPOSE_INTENT_EVENT_KEY,
  COMPOSE_INTENT_KEY,
  COMPOSE_INTENT_NEWS_KEY,
  COMPOSE_INTENT_TRAINING_KEY,
} from "@/lib/constants";
import { eventOrganizer } from "@/lib/event-ui";
import { formatOrganizerName } from "@/lib/organizer";

export function openFeedComposerWithAttachment(
  key: string,
  draft: object,
  push: (href: string) => void,
  isSignedIn = true,
) {
  window.sessionStorage.setItem(key, JSON.stringify(draft));
  window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
  window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
  push(isSignedIn ? "/" : "/auth/login?redirectTo=%2F");
}

export function newsComposeIntent(article: NewsArticle) {
  const draft: ComposerNewsDraft = {
    id: article.id,
    title: article.title,
    sourceUrl: article.source_url,
    sourceName: article.source_name,
    sourceLogoUrl: article.source_logo_url,
    imageUrl: article.image_url,
    summary: article.summary,
  };
  return { key: COMPOSE_INTENT_NEWS_KEY, draft };
}

export function trainingComposeIntent(training: TrainingListEntry) {
  const draft: ComposerTrainingDraft = {
    id: training.id,
    name: training.name,
    level: training.level,
    organizerName: formatOrganizerName(training),
    startDate: training.start_date,
    endDate: training.end_date,
    imageUrl: training.image_url,
  };
  return { key: COMPOSE_INTENT_TRAINING_KEY, draft };
}

export function eventComposeIntent(event: EventListEntry) {
  const draft: ComposerEventDraft = {
    id: event.id,
    title: event.title,
    categoryName: event.category_name,
    organizerName: eventOrganizer(event).author.name,
    organizerImageUrl: event.entity_image_url ?? undefined,
    startDate: event.start_date,
    endDate: event.end_date,
    imageUrl: event.thumbnail_url,
  };
  return { key: COMPOSE_INTENT_EVENT_KEY, draft };
}
