"use server";

import {
  createInstitution as createInstitutionApi,
  type Institution,
} from "@/apis/institutions";
import { logoutUser as logoutUserApi } from "@/apis/session";
import {
  activateUser as activateUserApi,
  createEducationHistory as createEducationHistoryApi,
  createTrainingHistory as createTrainingHistoryApi,
  deleteEducationHistory as deleteEducationHistoryApi,
  deleteTrainingHistory as deleteTrainingHistoryApi,
  followUser as followUserApi,
  updateEducationHistory as updateEducationHistoryApi,
  updateTrainingHistory as updateTrainingHistoryApi,
  updateUser as updateUserApi,
  unfollowUser as unfollowUserApi,
  verifyUser as verifyUserApi,
  type ActivationPayload,
  type CreateEducationHistoryPayload,
  type CreateTrainingHistoryPayload,
  type UpdateEducationHistoryPayload,
  type UpdateTrainingHistoryPayload,
  type UpdateUserPayload,
  type VerificationPayload,
} from "@/apis/users";
import {
  createCommentReply as createCommentReplyApi,
  createFeedComment as createFeedCommentApi,
  deleteComment as deleteCommentApi,
  deleteCommentReply as deleteCommentReplyApi,
  deleteFeed as deleteFeedApi,
  listCommentReplies as listCommentRepliesApi,
  listFeedComments as listFeedCommentsApi,
  listFeeds as listFeedsApi,
  repostFeed as repostFeedApi,
  unrepostFeed as unrepostFeedApi,
} from "@/apis/feeds";
import {
  listReactors as listReactorsApi,
  sendReaction as sendReactionApi,
  unsendReaction as unsendReactionApi,
} from "@/apis/reactions";
import type { ReactionTargetTypeEnum, ReactionTypeEnum } from "@/lib/types";

export async function activateUser(payload: ActivationPayload) {
  return activateUserApi(payload);
}

export async function verifyUser(payload: VerificationPayload) {
  return verifyUserApi(payload);
}

export async function updateUser(payload: UpdateUserPayload) {
  return updateUserApi(payload);
}

export async function followUser(userId: string) {
  return followUserApi(userId);
}

export async function unfollowUser(userId: string) {
  return unfollowUserApi(userId);
}

export async function createEducationHistory(
  payload: CreateEducationHistoryPayload
) {
  return createEducationHistoryApi(payload);
}

export async function updateEducationHistory(
  payload: UpdateEducationHistoryPayload
) {
  return updateEducationHistoryApi(payload);
}

export async function deleteEducationHistory(id: string) {
  return deleteEducationHistoryApi(id);
}

export async function createTrainingHistory(
  payload: CreateTrainingHistoryPayload
) {
  return createTrainingHistoryApi(payload);
}

export async function updateTrainingHistory(
  payload: UpdateTrainingHistoryPayload
) {
  return updateTrainingHistoryApi(payload);
}

export async function deleteTrainingHistory(id: string) {
  return deleteTrainingHistoryApi(id);
}

export async function logoutUser() {
  return logoutUserApi();
}

export async function createInstitution(
  name: string
): Promise<Institution | null> {
  return createInstitutionApi(name);
}

export async function loadMoreFeeds(page: number) {
  return listFeedsApi({ page, pageSize: 20 });
}

export async function listFeedComments(
  feedId: string,
  page?: number
) {
  return listFeedCommentsApi(feedId, { page });
}

export async function createFeedComment(feedId: string, message: string) {
  return createFeedCommentApi({ feedId, message });
}

export async function listCommentReplies(commentId: string, page?: number) {
  return listCommentRepliesApi(commentId, { page });
}

export async function createCommentReply(commentId: string, message: string) {
  return createCommentReplyApi({ commentId, message });
}

export async function deleteComment(commentId: string) {
  return deleteCommentApi(commentId);
}

export async function deleteCommentReply(replyId: string) {
  return deleteCommentReplyApi(replyId);
}

export async function deleteFeed(feedId: string) {
  return deleteFeedApi(feedId);
}

export async function repostFeed(feedId: string) {
  return repostFeedApi(feedId);
}

export async function unrepostFeed(feedId: string) {
  return unrepostFeedApi(feedId);
}

export async function sendReaction(
  targetType: ReactionTargetTypeEnum,
  targetId: string,
  type: ReactionTypeEnum
) {
  return sendReactionApi({ targetType, targetId, type });
}

export async function unsendReaction(
  targetType: ReactionTargetTypeEnum,
  targetId: string
) {
  return unsendReactionApi({ targetType, targetId });
}

export async function listReactors(
  targetType: ReactionTargetTypeEnum,
  targetId: string,
  page?: number
) {
  return listReactorsApi({ targetType, targetId, page });
}
