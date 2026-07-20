export type StatusEnum = "active" | "inactive";
export type UserStatusEnum = "pending" | "active" | "inactive";
export type GenderEnum = "male" | "female";
export type BranchTypeEnum = "full" | "provisional";
export type TrainingStatusEnum = "LK1" | "LK2" | "LK3";
export type TrainingResultEnum = "passed" | "conditional_pass" | "failed";
export type Degree =
  | "diploma_ahli_pratama"
  | "diploma_ahli_muda"
  | "diploma_ahli_madya"
  | "sarjana"
  | "magister"
  | "doktor";
export type FeedMediaTypeEnum = "photo" | "video" | "url";
export type ReactionTypeEnum =
  | "like"
  | "love"
  | "haha"
  | "wow"
  | "sad"
  | "angry";
export type ReactionTargetTypeEnum = "feed" | "comment" | "comment_reply";
export type ActivityTypeEnum = "post" | "quote_repost" | "repost" | "comment";
export type NotificationTypeEnum = "like" | "comment" | "comment_reply" | "follow";
export type NotificationEntityTypeEnum = "feed" | "comment" | "comment_reply" | "user";
export type SearchTypeEnum = "people" | "posting";
export type RevelationPlaceEnum = "mekkah" | "madinah";
export type MessageStatusEnum = "sent" | "read";

export type StatusName =
  | "OK"
  | "CREATED"
  | "NO_CONTENT"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

const SUCCESS_STATUSES: ReadonlySet<StatusName> = new Set([
  "OK",
  "CREATED",
  "NO_CONTENT",
]);

export function isSuccessStatus(status?: StatusName): boolean {
  return status !== undefined && SUCCESS_STATUSES.has(status);
}
