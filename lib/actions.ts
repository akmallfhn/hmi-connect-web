"use server";

import {
  acceptAccessGrant as acceptAccessGrantApi,
  inviteAccessGrant as inviteAccessGrantApi,
  listAccessGrants as listAccessGrantsApi,
  listMyAccessGrants as listMyAccessGrantsApi,
  revokeAccessGrant as revokeAccessGrantApi,
  type InviteAccessGrantPayload,
  type ListAccessGrantsOptions,
} from "@/apis/access-grants";
import {
  approveVerificationRequest as approveVerificationRequestApi,
  getVerificationRequestDetail as getVerificationRequestDetailApi,
  rejectVerificationRequest as rejectVerificationRequestApi,
} from "@/apis/verification-requests";
import {
  createBranch as createBranchApi,
  deleteBranch as deleteBranchApi,
  getBranchDetail as getBranchDetailApi,
  updateBranch as updateBranchApi,
  type CreateBranchPayload,
  type UpdateBranchPayload,
} from "@/apis/branches";
import {
  createChapter as createChapterApi,
  deleteChapter as deleteChapterApi,
  getChapterDetail as getChapterDetailApi,
  updateChapter as updateChapterApi,
  type CreateChapterPayload,
  type UpdateChapterPayload,
} from "@/apis/chapters";
import {
  createCoordinatingBody as createCoordinatingBodyApi,
  deleteCoordinatingBody as deleteCoordinatingBodyApi,
  getCoordinatingBodyDetail as getCoordinatingBodyDetailApi,
  updateCoordinatingBody as updateCoordinatingBodyApi,
  type CreateCoordinatingBodyPayload,
  type UpdateCoordinatingBodyPayload,
} from "@/apis/coordinating-bodies";
import {
  createCoordinatingChapter as createCoordinatingChapterApi,
  deleteCoordinatingChapter as deleteCoordinatingChapterApi,
  getCoordinatingChapterDetail as getCoordinatingChapterDetailApi,
  updateCoordinatingChapter as updateCoordinatingChapterApi,
  type CreateCoordinatingChapterPayload,
  type UpdateCoordinatingChapterPayload,
} from "@/apis/coordinating-chapters";
import {
  createInstitution as createInstitutionApi,
  type Institution,
} from "@/apis/institutions";
import {
  createStructuralOfficer as createStructuralOfficerApi,
  createStructuralPeriod as createStructuralPeriodApi,
  deleteStructuralOfficer as deleteStructuralOfficerApi,
  updateStructuralOfficer as updateStructuralOfficerApi,
  updateStructuralPeriod as updateStructuralPeriodApi,
  type CreateStructuralOfficerPayload,
  type CreateStructuralPeriodPayload,
  type UpdateStructuralOfficerPayload,
  type UpdateStructuralPeriodPayload,
} from "@/apis/structurals";
import { logoutUser as logoutUserApi } from "@/apis/session";
import {
  activateUser as activateUserApi,
  createEducationHistory as createEducationHistoryApi,
  createHonorAward as createHonorAwardApi,
  createOrganizationExperience as createOrganizationExperienceApi,
  createPublication as createPublicationApi,
  createSocialMediaAccount as createSocialMediaAccountApi,
  createTrainingHistory as createTrainingHistoryApi,
  createUser as createUserApi,
  createWorkExperience as createWorkExperienceApi,
  deactivateUser as deactivateUserApi,
  deleteEducationHistory as deleteEducationHistoryApi,
  deleteHonorAward as deleteHonorAwardApi,
  deleteOrganizationExperience as deleteOrganizationExperienceApi,
  deletePublication as deletePublicationApi,
  deleteSocialMediaAccount as deleteSocialMediaAccountApi,
  deleteTrainingHistory as deleteTrainingHistoryApi,
  deleteUser as deleteUserApi,
  deleteWorkExperience as deleteWorkExperienceApi,
  followUser as followUserApi,
  listFollowers as listFollowersApi,
  listFollowing as listFollowingApi,
  listUserActivity as listUserActivityApi,
  listUsers as listUsersApi,
  updateEducationHistory as updateEducationHistoryApi,
  updateHonorAward as updateHonorAwardApi,
  updateOrganizationExperience as updateOrganizationExperienceApi,
  updatePublication as updatePublicationApi,
  updateSocialMediaAccount as updateSocialMediaAccountApi,
  updateTrainingHistory as updateTrainingHistoryApi,
  updateUser as updateUserApi,
  updateMyProfile as updateMyProfileApi,
  updateWorkExperience as updateWorkExperienceApi,
  unfollowUser as unfollowUserApi,
  verifyUser as verifyUserApi,
  type ActivationPayload,
  type CreateEducationHistoryPayload,
  type CreateHonorAwardPayload,
  type CreateOrganizationExperiencePayload,
  type CreatePublicationPayload,
  type CreateSocialMediaAccountPayload,
  type CreateTrainingHistoryPayload,
  type CreateUserPayload,
  type CreateWorkExperiencePayload,
  type ListUsersOptions,
  type UpdateEducationHistoryPayload,
  type UpdateHonorAwardPayload,
  type UpdateMyProfilePayload,
  type UpdateOrganizationExperiencePayload,
  type UpdatePublicationPayload,
  type UpdateSocialMediaAccountPayload,
  type UpdateTrainingHistoryPayload,
  type UpdateUserPayload,
  type UpdateWorkExperiencePayload,
  type VerificationPayload,
} from "@/apis/users";
import {
  createCommentReply as createCommentReplyApi,
  createFeed as createFeedApi,
  createFeedComment as createFeedCommentApi,
  deleteComment as deleteCommentApi,
  deleteCommentReply as deleteCommentReplyApi,
  deleteFeed as deleteFeedApi,
  listCommentReplies as listCommentRepliesApi,
  listFeedComments as listFeedCommentsApi,
  listFeeds as listFeedsApi,
  repostFeed as repostFeedApi,
  unrepostFeed as unrepostFeedApi,
  updateFeed as updateFeedApi,
  type CreateFeedPayload,
} from "@/apis/feeds";
import {
  listReactors as listReactorsApi,
  sendReaction as sendReactionApi,
  unsendReaction as unsendReactionApi,
} from "@/apis/reactions";
import { listNewsArticles as listNewsArticlesApi } from "@/apis/news";
import {
  listNotifications as listNotificationsApi,
  markNotificationsAsRead as markNotificationsAsReadApi,
} from "@/apis/notifications";
import {
  searchPeople as searchPeopleApi,
  searchPostings as searchPostingsApi,
} from "@/apis/search";
import {
  deleteChatMessage as deleteChatMessageApi,
  deleteConversation as deleteConversationApi,
  findConversationWithUser as findConversationWithUserApi,
  listConversations as listConversationsApi,
  listMessages as listMessagesApi,
  markMessagesAsRead as markMessagesAsReadApi,
  sendChatMessage as sendChatMessageApi,
  updateChatMessage as updateChatMessageApi,
  type SendMessagePayload,
} from "@/apis/chats";
import {
  createTraining as createTrainingApi,
  createTrainingMaterial as createTrainingMaterialApi,
  deleteTraining as deleteTrainingApi,
  deleteTrainingMaterial as deleteTrainingMaterialApi,
  lockTrainingEvaluations as lockTrainingEvaluationsApi,
  registerTraining as registerTrainingApi,
  updateTraining as updateTrainingApi,
  updateTrainingEvaluation as updateTrainingEvaluationApi,
  updateTrainingMaterial as updateTrainingMaterialApi,
  type CreateTrainingMaterialPayload,
  type CreateTrainingPayload,
  type RegisterTrainingPayload,
  type UpdateTrainingEvaluationPayload,
  type UpdateTrainingMaterialPayload,
  type UpdateTrainingPayload,
} from "@/apis/trainings";
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

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  return updateMyProfileApi(payload);
}

// Super Admin-only admin panel (/master/users) — gated by MasterLayout, not re-checked here.
export async function listUsersAdmin(options: ListUsersOptions) {
  return listUsersApi(options);
}

export async function createUser(payload: CreateUserPayload) {
  return createUserApi(payload);
}

export async function deactivateUser(id: string) {
  return deactivateUserApi(id);
}

export async function deleteUser(id: string, username: string) {
  return deleteUserApi(id, username);
}

// Super Admin, or a manage grant on that same entity — see apis/access-grants.ts.
export async function listAccessGrants(options: ListAccessGrantsOptions) {
  return listAccessGrantsApi(options);
}

export async function listMyAccessGrants(options?: {
  page?: number;
  pageSize?: number;
}) {
  return listMyAccessGrantsApi(options);
}

export async function inviteAccessGrant(payload: InviteAccessGrantPayload) {
  return inviteAccessGrantApi(payload);
}

export async function acceptAccessGrant(id: string) {
  return acceptAccessGrantApi(id);
}

export async function revokeAccessGrant(id: string) {
  return revokeAccessGrantApi(id);
}

// Super Admin, or a manage grant on the request's branch — see apis/verification-requests.ts.
export async function approveVerificationRequest(id: string) {
  return approveVerificationRequestApi(id);
}

export async function rejectVerificationRequest(id: string, rejectionReason?: string) {
  return rejectVerificationRequestApi(id, rejectionReason);
}

export async function getVerificationRequestDetail(id: string) {
  return getVerificationRequestDetailApi(id);
}

// Super Admin, or a manage grant on the entity — /master/branches is gated by MasterLayout, not re-checked here.
export async function getBranchDetail(id: string) {
  return getBranchDetailApi(id);
}

export async function createBranch(payload: CreateBranchPayload) {
  return createBranchApi(payload);
}

export async function updateBranch(payload: UpdateBranchPayload) {
  return updateBranchApi(payload);
}

export async function deleteBranch(id: string) {
  return deleteBranchApi(id);
}

export async function getChapterDetail(id: string) {
  return getChapterDetailApi(id);
}

export async function createChapter(payload: CreateChapterPayload) {
  return createChapterApi(payload);
}

export async function updateChapter(payload: UpdateChapterPayload) {
  return updateChapterApi(payload);
}

export async function deleteChapter(id: string) {
  return deleteChapterApi(id);
}

export async function getCoordinatingBodyDetail(id: string) {
  return getCoordinatingBodyDetailApi(id);
}

export async function createCoordinatingBody(payload: CreateCoordinatingBodyPayload) {
  return createCoordinatingBodyApi(payload);
}

export async function updateCoordinatingBody(payload: UpdateCoordinatingBodyPayload) {
  return updateCoordinatingBodyApi(payload);
}

export async function deleteCoordinatingBody(id: string) {
  return deleteCoordinatingBodyApi(id);
}

export async function getCoordinatingChapterDetail(id: string) {
  return getCoordinatingChapterDetailApi(id);
}

export async function createCoordinatingChapter(
  payload: CreateCoordinatingChapterPayload
) {
  return createCoordinatingChapterApi(payload);
}

export async function updateCoordinatingChapter(
  payload: UpdateCoordinatingChapterPayload
) {
  return updateCoordinatingChapterApi(payload);
}

export async function deleteCoordinatingChapter(id: string) {
  return deleteCoordinatingChapterApi(id);
}

export async function createStructuralPeriod(
  payload: CreateStructuralPeriodPayload
) {
  return createStructuralPeriodApi(payload);
}

export async function createStructuralOfficer(
  payload: CreateStructuralOfficerPayload
) {
  return createStructuralOfficerApi(payload);
}

export async function updateStructuralOfficer(
  payload: UpdateStructuralOfficerPayload
) {
  return updateStructuralOfficerApi(payload);
}

export async function updateStructuralPeriod(
  payload: UpdateStructuralPeriodPayload
) {
  return updateStructuralPeriodApi(payload);
}

export async function deleteStructuralOfficer(id: string) {
  return deleteStructuralOfficerApi(id);
}

export async function createTraining(payload: CreateTrainingPayload) {
  return createTrainingApi(payload);
}

export async function updateTraining(payload: UpdateTrainingPayload) {
  return updateTrainingApi(payload);
}

export async function deleteTraining(id: string) {
  return deleteTrainingApi(id);
}

export async function registerTraining(payload: RegisterTrainingPayload) {
  return registerTrainingApi(payload);
}

export async function createTrainingMaterial(
  payload: CreateTrainingMaterialPayload
) {
  return createTrainingMaterialApi(payload);
}

export async function updateTrainingMaterial(
  payload: UpdateTrainingMaterialPayload
) {
  return updateTrainingMaterialApi(payload);
}

export async function deleteTrainingMaterial(id: string) {
  return deleteTrainingMaterialApi(id);
}

export async function updateTrainingEvaluation(
  payload: UpdateTrainingEvaluationPayload
) {
  return updateTrainingEvaluationApi(payload);
}

export async function lockTrainingEvaluations(trainingId: string) {
  return lockTrainingEvaluationsApi(trainingId);
}

export async function followUser(userId: string) {
  return followUserApi(userId);
}

export async function unfollowUser(userId: string) {
  return unfollowUserApi(userId);
}

export async function listFollowing(userId: string, page?: number) {
  return listFollowingApi(userId, { page });
}

export async function listFollowers(userId: string, page?: number) {
  return listFollowersApi(userId, { page });
}

export async function loadMoreUserActivity(username: string, page: number) {
  return listUserActivityApi(username, { page, pageSize: 20 });
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

export async function createOrganizationExperience(
  payload: CreateOrganizationExperiencePayload
) {
  return createOrganizationExperienceApi(payload);
}

export async function updateOrganizationExperience(
  payload: UpdateOrganizationExperiencePayload
) {
  return updateOrganizationExperienceApi(payload);
}

export async function deleteOrganizationExperience(id: string) {
  return deleteOrganizationExperienceApi(id);
}

export async function createWorkExperience(payload: CreateWorkExperiencePayload) {
  return createWorkExperienceApi(payload);
}

export async function updateWorkExperience(payload: UpdateWorkExperiencePayload) {
  return updateWorkExperienceApi(payload);
}

export async function deleteWorkExperience(id: string) {
  return deleteWorkExperienceApi(id);
}

export async function createHonorAward(payload: CreateHonorAwardPayload) {
  return createHonorAwardApi(payload);
}

export async function updateHonorAward(payload: UpdateHonorAwardPayload) {
  return updateHonorAwardApi(payload);
}

export async function deleteHonorAward(id: string) {
  return deleteHonorAwardApi(id);
}

export async function createPublication(payload: CreatePublicationPayload) {
  return createPublicationApi(payload);
}

export async function updatePublication(payload: UpdatePublicationPayload) {
  return updatePublicationApi(payload);
}

export async function deletePublication(id: string) {
  return deletePublicationApi(id);
}

export async function createSocialMediaAccount(
  payload: CreateSocialMediaAccountPayload
) {
  return createSocialMediaAccountApi(payload);
}

export async function updateSocialMediaAccount(
  payload: UpdateSocialMediaAccountPayload
) {
  return updateSocialMediaAccountApi(payload);
}

export async function deleteSocialMediaAccount(id: string) {
  return deleteSocialMediaAccountApi(id);
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

export async function loadMoreNewsArticles(page: number, categorySlug?: string) {
  return listNewsArticlesApi({ page, pageSize: 12, categorySlug });
}

export async function createFeed(payload: CreateFeedPayload) {
  return createFeedApi(payload);
}

export async function updateFeed(id: string, content: string) {
  return updateFeedApi({ id, content });
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

export async function listNotifications(page?: number) {
  return listNotificationsApi({ page, pageSize: 20 });
}

export async function loadMoreNotifications(page: number) {
  return listNotificationsApi({ page, pageSize: 20 });
}

export async function markNotificationsAsRead(ids?: string[]) {
  return markNotificationsAsReadApi(ids);
}

export async function loadMoreSearchPeople(keyword: string, page: number) {
  return searchPeopleApi(keyword, { page, pageSize: 20 });
}

export async function loadMoreSearchPostings(keyword: string, page: number) {
  return searchPostingsApi(keyword, { page, pageSize: 20 });
}

export async function listReactors(
  targetType: ReactionTargetTypeEnum,
  targetId: string,
  page?: number
) {
  return listReactorsApi({ targetType, targetId, page });
}

export async function listConversations(page?: number) {
  return listConversationsApi({ page, pageSize: 20 });
}

export async function loadMoreConversations(page: number) {
  return listConversationsApi({ page, pageSize: 20 });
}

export async function deleteConversation(id: string) {
  return deleteConversationApi(id);
}

export async function findConversationWithUser(otherUserId: string) {
  return findConversationWithUserApi(otherUserId);
}

export async function listMessages(conversationId: string, page?: number) {
  return listMessagesApi(conversationId, { page, pageSize: 30 });
}

export async function loadMoreMessages(conversationId: string, page: number) {
  return listMessagesApi(conversationId, { page, pageSize: 30 });
}

export async function sendChatMessage(payload: SendMessagePayload) {
  return sendChatMessageApi(payload);
}

export async function updateChatMessage(id: string, content: string) {
  return updateChatMessageApi(id, content);
}

export async function deleteChatMessage(id: string) {
  return deleteChatMessageApi(id);
}

export async function markMessagesAsRead(conversationId: string) {
  return markMessagesAsReadApi(conversationId);
}
