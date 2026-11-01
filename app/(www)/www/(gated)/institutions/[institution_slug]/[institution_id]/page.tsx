import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstitutionDetail } from "@/apis/institutions";
import { getSession } from "@/apis/session";
import InstitutionDetailPage from "@/components/pages/InstitutionDetailPage";

interface InstitutionRouteProps {
  params: Promise<{ institution_slug: string; institution_id: string }>;
}

export async function generateMetadata({
  params,
}: InstitutionRouteProps): Promise<Metadata> {
  const { institution_id } = await params;
  const institution = await getInstitutionDetail(Number(institution_id));
  return {
    title: institution?.name ?? "Institusi",
    robots: { index: false, follow: false },
  };
}

// Only the id resolves; the slug is decorative, so a stale one still renders the right institution.
export default async function InstitutionRoute({ params }: InstitutionRouteProps) {
  const { institution_id } = await params;
  const [institution, { user }] = await Promise.all([
    getInstitutionDetail(Number(institution_id)),
    getSession(),
  ]);
  if (!institution) notFound();

  return (
    <InstitutionDetailPage
      institution={institution}
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
    />
  );
}
