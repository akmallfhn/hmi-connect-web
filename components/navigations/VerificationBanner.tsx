import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";

interface VerificationBannerProps {
  userId?: string;
  verificationStatus?: VerificationStatusEnum;
}

// Rendered by the layout shell, above the desktop sidebar, so one account-wide notice spans the whole site.
export default function VerificationBanner({
  userId,
  verificationStatus,
}: VerificationBannerProps) {
  if (!userId) return null;

  if (verificationStatus === "unverified") {
    return (
      <div className="border-b border-destructive/20 bg-destructive-soft">
        <PageMargin className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-sm font-medium text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          <span>Akun kamu belum terverifikasi.</span>
          <Link
            href="/verification"
            className="underline underline-offset-2 hover:text-destructive-foreground"
          >
            Verifikasi sekarang
          </Link>
        </PageMargin>
      </div>
    );
  }

  if (verificationStatus === "pending") {
    return (
      <div className="border-b border-[#ECCF80]/40 bg-[#FFF6E0]">
        <PageMargin className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-sm font-medium text-[#8A6300]">
          <TriangleAlert className="size-4 shrink-0" />
          <span>Verifikasi akun kamu sedang ditinjau admin.</span>
        </PageMargin>
      </div>
    );
  }

  return null;
}
