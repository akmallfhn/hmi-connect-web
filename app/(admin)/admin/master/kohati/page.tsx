import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import AdminSpecialBodyListPage from "@/components/pages/AdminSpecialBodyListPage";
import {
  loadSpecialBodyPage,
  type SpecialBodyRouteQuery,
} from "@/lib/special-body-route";

export const metadata: Metadata = {
  title: "Kelola KOHATI",
  robots: { index: false, follow: false },
};

export default async function MasterKohatiPage({
  searchParams,
}: {
  searchParams: Promise<SpecialBodyRouteQuery>;
}) {
  const [query, { user }] = await Promise.all([searchParams, getSession()]);
  const props = await loadSpecialBodyPage({
    type: "kohati",
    scope: "master",
    organizationId: user?.organization_id ?? process.env.ORGANIZATION_ID,
    query,
  });

  return <AdminSpecialBodyListPage {...props} />;
}
