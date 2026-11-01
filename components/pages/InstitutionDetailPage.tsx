import { IconBuildingBank } from "@tabler/icons-react";
import { MapPin } from "lucide-react";
import Image from "next/image";
import type { InstitutionDetail } from "@/apis/institutions";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface InstitutionDetailPageProps {
  institution: InstitutionDetail;
  viewer: {
    fullName?: string;
    avatar?: string;
    userId?: string;
    username?: string;
    verificationStatus?: VerificationStatusEnum;
  };
}

// Identity only for now; the rest of the institution page is still to be designed.
export default function InstitutionDetailPage({
  institution,
  viewer,
}: InstitutionDetailPageProps) {
  const location = [
    institution.address,
    institution.district_name,
    institution.city_name,
    institution.province_name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Institusi"
      />

      <PageMargin className="pb-6 pt-4 lg:pt-6">
        <main className="min-w-0">
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
              {institution.image_url ? (
                <Image
                  src={institution.image_url}
                  alt={institution.name}
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : (
                <IconBuildingBank
                  className="size-7 text-muted-foreground"
                  stroke={1.8}
                />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-stack-sans-headline text-xl font-medium text-heading lg:text-2xl">
                {institution.name}
              </h1>
              {institution.alias && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {institution.alias}
                </p>
              )}
              {location && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {location}
                </p>
              )}
            </div>
          </div>
        </main>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
