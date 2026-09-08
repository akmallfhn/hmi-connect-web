import Image from "next/image";
import Link from "next/link";
import type { SessionUser } from "@/apis/session";
import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import { entityProfileHref } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import LogoHmi from "../svg/LogoHmi";

interface OfficialAccountPageProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  name: string;
  imageUrl?: string | null;
  viewer: SessionUser | null;
}

export default function OfficialAccountPage({
  entityType,
  entityId,
  name,
  imageUrl,
  viewer,
}: OfficialAccountPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer?.full_name}
        avatar={viewer?.avatar}
        userId={viewer?.id}
        username={viewer?.username}
        verificationStatus={viewer?.verification_status}
        mobileBackTitle="Akun Resmi"
      />

      <PageMargin noMobilePadding className="pb-6 lg:py-6">
        <div className="mx-auto flex max-w-[768px] flex-col gap-1.5 lg:gap-4">
          <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f5f7fb]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <LogoHmi className="size-7" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6573]">
                  Akun Resmi {ADMIN_ENTITY_LABEL[entityType]}
                </p>
                <p className="truncate text-lg font-bold text-[#172033]">
                  {name}
                </p>
              </div>
            </div>

            <Link
              href={entityProfileHref(entityType, entityId)}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Lihat profil publik
            </Link>
          </div>

          <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
            <p className="rounded-xl border border-dashed border-[#dbe3ef] px-4 py-6 text-center text-sm text-[#5f6573] xl:text-[15px]">
              Fitur akun resmi sedang disiapkan.
            </p>
          </div>
        </div>
      </PageMargin>

      <BottomNav userId={viewer?.id} username={viewer?.username} />
    </div>
  );
}
