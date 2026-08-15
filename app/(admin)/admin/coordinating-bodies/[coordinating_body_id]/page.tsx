import type { Metadata } from "next";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getBranchMap } from "@/apis/stat";
import AdminDashboardBanner from "@/components/banners/AdminDashboardBanner";
import IndonesiaBranchMap from "@/components/charts/IndonesiaBranchMap";
import AdminPageTitle from "@/components/common/AdminPageTitle";

export const metadata: Metadata = {
  title: "Dashboard Badko",
  robots: {
    index: false,
    follow: false,
  },
};

interface CoordinatingBodyDetailPageProps {
  params: Promise<{ coordinating_body_id: string }>;
}

export default async function CoordinatingBodyDetailPage({
  params,
}: CoordinatingBodyDetailPageProps) {
  const { coordinating_body_id } = await params;
  const [coordinatingBody, branchMap] = await Promise.all([
    getCoordinatingBodyDetail(coordinating_body_id),
    getBranchMap({
      coverage: "nationwide",
      coordinatingBodyId: coordinating_body_id,
    }),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Ringkasan data Cabang di bawah Badko ${coordinatingBody?.name ?? "ini"}.`}
      >
        Dashboard Badko
      </AdminPageTitle>

      <div className="mt-6">
        <AdminDashboardBanner />
      </div>

      <div className="mt-4">
        <IndonesiaBranchMap
          initialBranches={branchMap?.list ?? []}
          coordinatingBodyId={coordinating_body_id}
        />
      </div>
    </div>
  );
}
