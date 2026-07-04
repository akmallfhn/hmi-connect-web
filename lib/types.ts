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
