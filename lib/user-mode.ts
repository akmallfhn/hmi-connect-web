import "server-only";

import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { selectedActingEntityRef } from "@/lib/acting-entity";

// A valid official-account selection cannot open personal pages.
export async function requireUserMode() {
  const { user } = await getSession();
  if (await selectedActingEntityRef(user)) notFound();
}
