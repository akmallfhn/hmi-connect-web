import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/apis/session";

export default async function GatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, user } = await getSession();

  if (!sessionToken) redirect("/api/auth/clear-session");

  if (user?.status === "pending") redirect("/activation");

  return <>{children}</>;
}
