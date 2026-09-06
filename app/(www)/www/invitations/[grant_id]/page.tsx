import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccessGrantDetail } from "@/apis/access-grants";
import { getSession } from "@/apis/session";
import { ADMIN_ENTITY_LABEL, adminEntityHref } from "@/lib/access";
import { getAdminSiteOrigin } from "@/lib/constants";
import AccessInvitationPage from "@/components/pages/AccessInvitationPage";
import PageState from "@/components/states/PageState";

export const metadata: Metadata = {
  title: "Undangan Admin",
  robots: { index: false, follow: false },
};

interface AccessInvitationRouteProps {
  params: Promise<{ grant_id: string }>;
}

export default async function AccessInvitationRoute({
  params,
}: AccessInvitationRouteProps) {
  const { grant_id } = await params;
  const { sessionToken, user } = await getSession();

  if (!sessionToken || !user?.id) {
    redirect(
      `/auth/login?redirectTo=${encodeURIComponent(`/invitations/${grant_id}`)}`
    );
  }

  if (user.status === "pending") redirect("/activation");

  // access-grants/detail 403s for anyone but the holder, so another account never resolves this id.
  const grant = await getAccessGrantDetail(grant_id);

  if (!grant) {
    return (
      <PageState
        variant="not_found"
        message="Undangan ini tidak ditemukan, sudah dicabut, atau ditujukan untuk akun lain. Pastikan kamu masuk dengan akun yang menerima undangan."
      />
    );
  }

  return (
    <AccessInvitationPage
      grant={grant}
      entityLabel={ADMIN_ENTITY_LABEL[grant.entity_type]}
      dashboardUrl={`${getAdminSiteOrigin()}${adminEntityHref(
        grant.entity_type,
        grant.entity_id
      )}`}
    />
  );
}
