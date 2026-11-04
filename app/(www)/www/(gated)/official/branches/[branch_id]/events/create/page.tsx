import type { Metadata } from "next";
import { renderOfficialEventCreate } from "@/lib/official-event-pages";

export const metadata: Metadata = {
  title: "Buat Event",
  robots: { index: false, follow: false },
};

export default async function BranchOfficialEventCreate({
  params,
}: {
  params: Promise<{ branch_id: string }>;
}) {
  const { branch_id } = await params;
  return renderOfficialEventCreate("branch", branch_id);
}
