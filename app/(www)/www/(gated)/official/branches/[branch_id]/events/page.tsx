import type { Metadata } from "next";
import { renderOfficialEvents } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Kelola Event",
  robots: { index: false, follow: false },
};

export default async function BranchOfficialEvents({
  params,
  searchParams,
}: {
  params: Promise<{ branch_id: string }>;
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  const [{ branch_id }, query] = await Promise.all([params, searchParams]);
  return renderOfficialEvents("branch", branch_id, query);
}
