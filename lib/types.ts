export type StatusEnum = "active" | "inactive";
export type UserStatusEnum = "pending" | "active" | "inactive";
export type VerificationStatusEnum = "unverified" | "pending" | "verified";
export type VerificationRequestStatusEnum = "pending" | "approved" | "rejected";
export type GenderEnum = "male" | "female";
export type BranchTypeEnum = "full" | "provisional";
export type TrainingStatusEnum = "LK1" | "LK2" | "LK3";
export type TrainingResultEnum = "passed" | "conditional_pass" | "failed";
export type TrainingOrganizerTypeEnum =
  | "chapter"
  | "branch"
  | "coordinating_body"
  | "organization";
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
// The five organization-hierarchy entities an access grant (and a structural period) can point at.
export type AccessEntityTypeEnum =
  | "organization"
  | "coordinating_body"
  | "branch"
  | "chapter"
  | "coordinating_chapter";
export type AccessCapabilityEnum = "manage";
export type AccessGrantStatusEnum = "pending" | "accepted";
export type StructuralEntityTypeEnum = AccessEntityTypeEnum;

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
