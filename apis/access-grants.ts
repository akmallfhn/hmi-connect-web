import "server-only";

import { cookies } from "next/headers";
import { after } from "next/server";
import { render } from "@react-email/components";
import { callApi, type ApiEnvelope } from "./api";
import AccessInvitationEmail, {
  type AccessInvitationEmailProps,
} from "@/components/emails/AccessInvitationEmail";
import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import { sendEmail } from "@/lib/mailtrap";
import {
  isSuccessStatus,
  type AccessCapabilityEnum,
  type AccessEntityTypeEnum,
  type AccessGrantStatusEnum,
} from "@/lib/types";
import { getMainSiteOrigin, SESSION_COOKIE_NAME } from "@/lib/constants";

// Mirrors one row of POST /api/v1/access-grants/list — a grant, or an invitation not yet accepted.
export type AccessGrantEntry = {
  id: string;
  user_id: string;
  entity_type: AccessEntityTypeEnum;
  entity_id: string;
  entity_name?: string;
  capability: AccessCapabilityEnum;
  status: AccessGrantStatusEnum;
  granted_by: string;
  granted_at: string;
  accepted_at?: string | null;
  user_full_name?: string;
  user_username?: string;
  user_email?: string;
  user_avatar?: string | null;
  granted_by_name?: string;
};

export type PagedListResult<T> = {
  list: T[];
  totalData: number;
  totalPage: number;
  currentPage: number;
};

type AccessGrantListResponse = {
  list: AccessGrantEntry[];
  metapaging?: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
};

const EMPTY_PAGE: PagedListResult<AccessGrantEntry> = {
  list: [],
  totalData: 0,
  totalPage: 1,
  currentPage: 1,
};

async function sessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

function toPagedResult(
  result: ApiEnvelope<AccessGrantListResponse>,
  page: number
): PagedListResult<AccessGrantEntry> {
  if (!isSuccessStatus(result.status) || !result.data) return EMPTY_PAGE;
  const meta = result.data.metapaging;
  return {
    list: result.data.list ?? [],
    totalData: meta?.total_data ?? result.data.list?.length ?? 0,
    totalPage: meta?.total_page ?? 1,
    currentPage: meta?.current_page ?? page,
  };
}

export type ListAccessGrantsOptions = {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

// Everyone holding access on one entity, pending invitations included. Super Admin, or a manage grant on that same entity.
export async function listAccessGrants(
  options: ListAccessGrantsOptions
): Promise<PagedListResult<AccessGrantEntry>> {
  const token = await sessionToken();
  if (!token) return EMPTY_PAGE;

  const { entityType, entityId, search, page = 1, pageSize = 20 } = options;
  const result = await callApi<AccessGrantListResponse>(
    "/api/v1/access-grants/list",
    {
      method: "POST",
      token,
      body: {
        entity_type: entityType,
        entity_id: entityId,
        ...(search ? { search } : {}),
        page,
        page_size: pageSize,
      },
    }
  );

  return toPagedResult(result, page);
}

// Every holder on one entity, pages exhausted — replaces the old users/list crawl that filtered on can_manage_*.
export async function listAllAccessGrants(
  entityType: AccessEntityTypeEnum,
  entityId: string
): Promise<AccessGrantEntry[]> {
  const pageSize = 100;
  const firstPage = await listAccessGrants({
    entityType,
    entityId,
    page: 1,
    pageSize,
  });

  if (firstPage.totalPage <= 1) return firstPage.list;

  const rest = await Promise.all(
    Array.from({ length: firstPage.totalPage - 1 }, (_, index) =>
      listAccessGrants({ entityType, entityId, page: index + 2, pageSize })
    )
  );

  return [firstPage, ...rest].flatMap((page) => page.list);
}

// The caller's own grants, including invitations they have not accepted yet.
export async function listMyAccessGrants(
  options: { page?: number; pageSize?: number } = {}
): Promise<PagedListResult<AccessGrantEntry>> {
  const token = await sessionToken();
  if (!token) return EMPTY_PAGE;

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<AccessGrantListResponse>(
    "/api/v1/access-grants/my/list",
    { method: "POST", token, body: { page, page_size: pageSize } }
  );

  return toPagedResult(result, page);
}

// One grant by id, readable only by the holder it names — `null` when it isn't theirs, or was revoked.
export async function getAccessGrantDetail(
  id: string
): Promise<AccessGrantEntry | null> {
  const token = await sessionToken();
  if (!token) return null;

  const result = await callApi<AccessGrantEntry>(
    "/api/v1/access-grants/detail",
    { method: "POST", token, body: { id } }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

export type InviteAccessGrantPayload = {
  userId: string;
  entityType: AccessEntityTypeEnum;
  entityId: string;
  capability?: AccessCapabilityEnum;
};

// Creates a pending invitation — it confers nothing until the invitee accepts.
export async function inviteAccessGrant(
  payload: InviteAccessGrantPayload
): Promise<ApiEnvelope<AccessGrantEntry>> {
  const token = await sessionToken();
  if (!token) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  const result = await callApi<AccessGrantEntry>(
    "/api/v1/access-grants/invite",
    {
      method: "POST",
      token,
      body: {
        user_id: payload.userId,
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        capability: payload.capability ?? "manage",
      },
    }
  );

  const grant = isSuccessStatus(result.status) ? result.data : undefined;
  const recipient = grant?.user_email;

  if (grant && recipient) {
    const props: AccessInvitationEmailProps = {
      fullName: grant.user_full_name ?? "Kader",
      inviterName: grant.granted_by_name ?? "Admin",
      entityLabel: ADMIN_ENTITY_LABEL[grant.entity_type],
      entityName: grant.entity_name ?? "",
      invitationUrl: `${getMainSiteOrigin()}/invitations/${grant.id}`,
    };

    // after() so the send outlives the action's own response instead of racing it.
    after(async () => {
      try {
        await sendAccessInvitationEmail(recipient, props);
      } catch (err) {
        console.error("[inviteAccessGrant] invitation email job threw:", err);
      }
    });
  }

  return result;
}

// A failed send must never fail the invitation itself, so this only ever logs.
async function sendAccessInvitationEmail(
  recipient: string,
  props: AccessInvitationEmailProps
) {
  const html = await render(AccessInvitationEmail(props));

  await sendEmail({
    mailRecipients: [recipient],
    mailSubject: `Undangan jadi admin ${props.entityLabel} di HMI Connect`,
    mailHtml: html,
  });
}

// Accepts an invitation addressed to the caller, activating the grant.
export async function acceptAccessGrant(
  id: string
): Promise<ApiEnvelope<AccessGrantEntry>> {
  const token = await sessionToken();
  if (!token) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<AccessGrantEntry>("/api/v1/access-grants/accept", {
    method: "POST",
    token,
    body: { id },
  });
}

// Takes the grant id, not a user id — and cascades to grants its holder issued on this same entity.
export async function revokeAccessGrant(
  id: string
): Promise<ApiEnvelope<{ revoked_count: number }>> {
  const token = await sessionToken();
  if (!token) {
    return {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  return callApi<{ revoked_count: number }>("/api/v1/access-grants/revoke", {
    method: "POST",
    token,
    body: { id },
  });
}
