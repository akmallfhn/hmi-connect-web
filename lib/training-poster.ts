import {
  EVENT_IMAGE_ACCEPT,
  uploadEventImage,
  type EventImageUploadResult,
} from "@/lib/event-image";

export const TRAINING_POSTER_ACCEPT = EVENT_IMAGE_ACCEPT;

export type TrainingPosterUploadResult = EventImageUploadResult;

// Validates, optimizes, and uploads a training poster through the media service.
export async function uploadTrainingPoster(
  file: File
): Promise<TrainingPosterUploadResult> {
  return uploadEventImage(file);
}
