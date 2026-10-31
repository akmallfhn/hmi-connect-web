import type { Metadata } from "next";
import AdminSpecialBodyListPage from "@/components/pages/AdminSpecialBodyListPage";
import {
  loadSpecialBodyPage,
  type SpecialBodyRouteQuery,
} from "@/lib/special-body-route";

export const metadata: Metadata = {
  title: "Kelola BPL",
  robots: { index: false, follow: false },
};

export default async function OrganizationBplPage({
  params,
  searchParams,
}: {
  params: Promise<{ organization_id: string }>;
  searchParams: Promise<SpecialBodyRouteQuery>;
}) {
  const [{ organization_id }, query] = await Promise.all([params, searchParams]);
  const props = await loadSpecialBodyPage({
    type: "bpl",
    scope: "organization",
    organizationId: organization_id,
    query,
  });

  return <AdminSpecialBodyListPage {...props} />;
}
