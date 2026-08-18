import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/apis/branches";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { listTrainings } from "@/apis/trainings";
import BranchDetailPage, {
  type BranchDetailTab,
} from "@/components/pages/BranchDetailPage";

export const metadata: Metadata = {
  title: "Detail Cabang",
  robots: {
    index: false,
    follow: false,
  },
};

interface OrganizationBranchDetailPageProps {
  params: Promise<{ organization_id: string; branch_id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

function parseTab(tab?: string): BranchDetailTab {
  if (tab === "management" || tab === "chapters" || tab === "trainings") {
    return tab;
  }
  return "profile";
}

export default async function OrganizationBranchDetailPage({
  params,
  searchParams,
}: OrganizationBranchDetailPageProps) {
  const [{ organization_id, branch_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const branch = await getBranchDetail(branch_id);
  if (!branch || branch.coordinating_body?.organization_id !== organization_id) {
    notFound();
  }

  const [chapters, trainingResult] = await Promise.all([
    listAllChaptersAdmin({ branchId: branch_id }),
    listTrainings({
      organizerType: "branch",
      organizerId: branch_id,
      page: 1,
      pageSize: 100,
    }),
  ]);

  return (
    <BranchDetailPage
      branch={branch}
      chapters={chapters}
      trainings={trainingResult.list}
      initialTab={parseTab(query.tab)}
      backHref={`/organizations/${organization_id}/branches`}
      allowEdit={false}
    />
  );
}
