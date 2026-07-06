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
  updateEducationHistory as updateEducationHistoryApi,
  updateTrainingHistory as updateTrainingHistoryApi,
  updateUser as updateUserApi,
  type ActivationPayload,
  type CreateEducationHistoryPayload,
  type CreateTrainingHistoryPayload,
  type UpdateEducationHistoryPayload,
  type UpdateTrainingHistoryPayload,
  type UpdateUserPayload,
} from "@/apis/users";

export async function activateUser(payload: ActivationPayload) {
  return activateUserApi(payload);
}

export async function updateUser(payload: UpdateUserPayload) {
  return updateUserApi(payload);
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
