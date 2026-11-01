import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getInstitutionDetail,
  listInstitutionMembers,
  type InstitutionDetail,
} from "@/apis/institutions";
import { getSession } from "@/apis/session";
import InstitutionDetailPage from "@/components/pages/InstitutionDetailPage";
import { getMainSiteOrigin } from "@/lib/constants";
import {
  institutionAddressLine,
  institutionHref,
  institutionLocationLine,
} from "@/lib/institution";

interface InstitutionRouteProps {
  params: Promise<{ institution_slug: string; institution_id: string }>;
}

// Falls back to the institution's own identity so every page has a unique description.
function metaDescription(institution: InstitutionDetail): string {
  const own = institution.description?.trim();
  if (own) return own;
  return [
    `${institution.name}, ${institutionLocationLine(institution)}.`,
    institutionAddressLine(institution) ? `${institutionAddressLine(institution)}.` : null,
    "Lihat kader HMI yang pernah bersekolah di sini di HMI Connect.",
  ]
    .filter(Boolean)
    .join(" ");
}

// Public and indexable; the canonical points at the real slug, so a stale or hand-typed slug never duplicates the page.
export async function generateMetadata({
  params,
}: InstitutionRouteProps): Promise<Metadata> {
  const { institution_id } = await params;
  const institution = await getInstitutionDetail(Number(institution_id));
  if (!institution) {
    return {
      title: "Institusi Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description = metaDescription(institution);
  const url = institutionHref(institution.id, institution.slug);
  const images = institution.image_url ? [institution.image_url] : undefined;
  return {
    title: institution.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${institution.name} | HMI Connect`,
      description,
      url,
      images,
    },
    twitter: {
      card: "summary",
      title: `${institution.name} | HMI Connect`,
      description,
      images,
    },
  };
}

// Only the id resolves; the slug is decorative, so a stale one still renders the right institution.
export default async function InstitutionRoute({ params }: InstitutionRouteProps) {
  const { institution_id } = await params;
  const id = Number(institution_id);
  const [institution, members, { user }] = await Promise.all([
    getInstitutionDetail(id),
    listInstitutionMembers(id),
    getSession(),
  ]);
  if (!institution) notFound();

  const url = `${getMainSiteOrigin()}${institutionHref(institution.id, institution.slug)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: institution.name,
    ...(institution.alias ? { alternateName: institution.alias } : {}),
    url,
    ...(institution.image_url ? { logo: institution.image_url } : {}),
    description: metaDescription(institution),
    ...(institution.city_name || institution.province_name
      ? {
          address: {
            "@type": "PostalAddress",
            ...(institution.address ? { streetAddress: institution.address } : {}),
            ...(institution.city_name ? { addressLocality: institution.city_name } : {}),
            ...(institution.province_name ? { addressRegion: institution.province_name } : {}),
            addressCountry: "ID",
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escaping "<" keeps a name or description from closing the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <InstitutionDetailPage
        institution={institution}
        members={members}
        viewer={{
          fullName: user?.full_name,
          avatar: user?.avatar,
          userId: user?.id,
          username: user?.username,
          verificationStatus: user?.verification_status,
        }}
      />
    </>
  );
}
