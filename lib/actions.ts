"use server";

import {
  createInstitution as createInstitutionApi,
  type Institution,
} from "@/apis/institutions";
import { logoutUser as logoutUserApi } from "@/apis/session";
import {
  activateUser as activateUserApi,
  updateUser as updateUserApi,
  type ActivationPayload,
  type UpdateUserPayload,
} from "@/apis/users";

export async function activateUser(payload: ActivationPayload) {
  return activateUserApi(payload);
}

export async function updateUser(payload: UpdateUserPayload) {
  return updateUserApi(payload);
}

export async function logoutUser() {
  return logoutUserApi();
}

export async function createInstitution(
  name: string
): Promise<Institution | null> {
  return createInstitutionApi(name);
}
