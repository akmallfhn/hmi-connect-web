"use server";

import {
  createInstitution as createInstitutionApi,
  type Institution,
} from "@/apis/institutions";
import {
  activateUser as activateUserApi,
  type ActivationPayload,
} from "@/apis/users";

export async function activateUser(payload: ActivationPayload) {
  return activateUserApi(payload);
}

export async function createInstitution(
  name: string
): Promise<Institution | null> {
  return createInstitutionApi(name);
}
