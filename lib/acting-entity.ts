import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listMyAccessGrants } from "@/apis/access-grants";
import type { SessionUser } from "@/apis/session";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import {
  holdsGrantAtEntity,
  manageGrants,
  formatActingEntityRef,
  resolveSelectedActingAccount,
  type ActingEntityRef,
} from "@/lib/access";
import { ACTING_ACCOUNT_COOKIE_NAME, getSessionCookieDomain } from "@/lib/constants";
import { formatEntityAuthorName } from "@/lib/feed-author";

// Old bookmarked `?as=` URLs are cleaned without allowing the URL to select an identity.
export function redirectWithoutLegacyActingParam(
  pathname: string,
  query: Record<string, string | string[] | undefined> | undefined,
) {
  if (!query || !("as" in query)) return;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key === "as") continue;
    for (const item of Array.isArray(value) ? value : value ? [value] : []) {
      params.append(key, item);
    }
  }
  const search = params.toString();
  redirect(`${pathname}${search ? `?${search}` : ""}`);
}

// check-session omits the entity logo; cached so the layout and the page share one lookup per request.
export const listGrantEntityLogos = cache(
  async (): Promise<Map<string, string | null>> => {
    const { list } = await listMyAccessGrants({ pageSize: 100 });
    return new Map(
      list.map((grant) => [grant.entity_id, grant.entity_image_url ?? null]),
    );
  },
);

// Same gate as the official pages: a grant at exactly that entity, so Super Admin alone does not qualify.
export async function selectedActingEntityRef(
  user: SessionUser | null | undefined,
): Promise<ActingEntityRef | null> {
  if (!user?.id) return null;
  const raw = (await cookies()).get(ACTING_ACCOUNT_COOKIE_NAME)?.value;
  return resolveSelectedActingAccount(raw, user);
}

export async function setActingAccount(
  user: SessionUser | null | undefined,
  ref: ActingEntityRef | null,
): Promise<boolean> {
  if (!user?.id || (ref && !holdsGrantAtEntity(user, ref.entityType, ref.entityId))) {
    return false;
  }
  const cookieStore = await cookies();
  const domain = getSessionCookieDomain();
  if (!ref) {
    cookieStore.delete({ name: ACTING_ACCOUNT_COOKIE_NAME, ...(domain ? { domain } : {}) });
  } else {
    cookieStore.set(ACTING_ACCOUNT_COOKIE_NAME, `${user.id}|${formatActingEntityRef(ref)}`, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      ...(domain ? { domain } : {}),
    });
  }
  return true;
}

// The cookie only selects an account. A current exact grant remains the authority.
export async function resolveActingEntity(
  user: SessionUser | null | undefined,
): Promise<ComposerAuthorEntity | null> {
  const ref = await selectedActingEntityRef(user);
  if (!ref) return null;

  const grant = manageGrants(user).find(
    (item) =>
      item.entity_type === ref.entityType && item.entity_id === ref.entityId,
  );
  const logos = await listGrantEntityLogos();

  return {
    type: ref.entityType,
    id: ref.entityId,
    name: grant?.entity_name
      ? formatEntityAuthorName(ref.entityType, grant.entity_name)
      : "Akun Resmi",
    imageUrl: logos.get(ref.entityId) ?? null,
  };
}
