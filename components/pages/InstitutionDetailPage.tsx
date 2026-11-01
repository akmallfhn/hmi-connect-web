import { IconBuildingBank } from "@tabler/icons-react";
import { MapPin } from "lucide-react";
import Image from "next/image";
import type { InstitutionDetail, InstitutionMembersResult } from "@/apis/institutions";
import { institutionAddressLine, institutionLocationLine } from "@/lib/institution";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import SuggestedConnectionsCard from "../feeds/SuggestedConnectionsCard";
import InstitutionMemberGrid from "../institutions/InstitutionMemberGrid";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface InstitutionDetailPageProps {
  institution: InstitutionDetail;
  members: InstitutionMembersResult;
  viewer: {
    fullName?: string;
    avatar?: string;
    userId?: string;
    username?: string;
    verificationStatus?: VerificationStatusEnum;
  };
}

// Mirrors ProfilePage: a cover-and-logo header with city and address, the description card, then the people who studied here.
export default function InstitutionDetailPage({
  institution,
  members,
  viewer,
}: InstitutionDetailPageProps) {
  const locationLine = institutionLocationLine(institution);
  const addressLine = institutionAddressLine(institution);
  const description = institution.description?.trim();

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

      <PageMargin noMobilePadding className="pb-6 lg:py-6">
        <div className="grid grid-cols-1 gap-1.5 lg:items-start lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
            <section className="overflow-hidden border border-x-0 border-border bg-surface lg:rounded-2xl lg:border-x">
              <div className="relative h-28 overflow-hidden bg-primary-soft sm:h-36">
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-24 size-72 sm:right-8"
                >
                  <div className="absolute inset-0 rounded-full border-[32px] border-primary-light opacity-50" />
                  <div className="absolute left-[-5.5rem] top-32 size-44 rounded-full border-[24px] border-primary-light opacity-40 sm:top-36" />
                </div>
              </div>

              <div className="px-5 pb-5 lg:px-6 lg:pb-6">
                <div className="relative -mt-14 flex size-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-surface bg-surface lg:-mt-16">
                  {institution.image_url ? (
                    <Image
                      src={institution.image_url}
                      alt={institution.name}
                      width={112}
                      height={112}
                      className="size-full object-cover"
                    />
                  ) : (
                    <IconBuildingBank
                      className="size-12 text-muted-foreground"
                      stroke={1.6}
                    />
                  )}
                </div>

                <h1 className="mt-3 font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
                  {institution.name}
                </h1>
                <p className="mt-1 text-sm text-heading xl:text-[15px]">
                  {locationLine}
                </p>
                {addressLine && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground xl:text-[15px]">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary-foreground" />
                    {addressLine}
                  </p>
                )}
              </div>
            </section>

            {description && (
              <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
                <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
                  Tentang {institution.name}
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-content-foreground xl:text-[15px]">
                  {description}
                </p>
              </section>
            )}

            <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
              <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">
                {members.totalData.toLocaleString("id-ID")} orang pernah bersekolah di sini
              </h2>
              <div className="mt-4">
                <InstitutionMemberGrid
                  institutionId={institution.id}
                  viewerId={viewer.userId}
                  initialItems={members.list}
                  initialHasMore={members.hasMore}
                />
              </div>
            </section>
          </div>

          <aside className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-4 lg:self-start">
            <SuggestedConnectionsCard />
          </aside>
        </div>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
