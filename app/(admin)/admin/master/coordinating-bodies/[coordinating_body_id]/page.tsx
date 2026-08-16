import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllBranchesAdmin } from "@/apis/branches";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { listTrainings } from "@/apis/trainings";
import CoordinatingBodyDetailPage, {
  type CoordinatingBodyDetailTab,
} from "@/components/pages/CoordinatingBodyDetailPage";

export const metadata: Metadata = {
  title: "Detail Badko",
  robots: {
    index: false,
    follow: false,
  },
};

interface MasterCoordinatingBodyDetailPageProps {
  params: Promise<{ coordinating_body_id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

function parseTab(tab?: string): CoordinatingBodyDetailTab {
  if (tab === "management" || tab === "branches" || tab === "trainings") {
    return tab;
  }
  return "profile";
}

export default async function MasterCoordinatingBodyDetailPage({
  params,
  searchParams,
}: MasterCoordinatingBodyDetailPageProps) {
  const [{ coordinating_body_id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const coordinatingBody =
    await getCoordinatingBodyDetail(coordinating_body_id);
  if (!coordinatingBody) notFound();

  const [branches, trainingResult] = await Promise.all([
    listAllBranchesAdmin({ coordinatingBodyId: coordinating_body_id }),
    listTrainings({
      organizerType: "coordinating_body",
      organizerId: coordinating_body_id,
      page: 1,
      pageSize: 100,
    }),
  ]);

  return (
    <CoordinatingBodyDetailPage
      coordinatingBody={coordinatingBody}
      branches={branches}
      trainings={trainingResult.list}
      initialTab={parseTab(query.tab)}
      backHref="/master/coordinating-bodies"
    />
  );
}
