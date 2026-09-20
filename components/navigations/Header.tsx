"use client";

import {
  ArrowLeft,
  EllipsisVertical,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import type { VerificationStatusEnum } from "@/lib/types";
import Dropdown from "../common/Dropdown";
import PageMargin from "../common/PageMargin";
import Button from "../buttons/Button";

interface HeaderProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
  loading?: boolean;
  mobileBackTitle?: string;
  mobileMenu?: ReactNode;
  mobileMenuLabel?: string;
  desktopFilterBar?: ReactNode;
}

export default function Header({
  userId,
  verificationStatus,
  mobileBackTitle,
  mobileMenu,
  mobileMenuLabel = "Menu",
  desktopFilterBar,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40">

      {userId && verificationStatus === "unverified" && (
        <div className="border-t border-destructive/20 bg-destructive-soft">
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
      )}

      {userId && verificationStatus === "pending" && (
        <div className="border-t border-[#ECCF80]/40 bg-[#FFF6E0]">
          <PageMargin className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-sm font-medium text-[#8A6300]">
            <TriangleAlert className="size-4 shrink-0" />
            <span>Verifikasi akun kamu sedang ditinjau admin.</span>
          </PageMargin>
        </div>
      )}

      {desktopFilterBar && (
        <div className="hidden border-t border-[#e6e9ef] bg-white lg:block">
          <PageMargin className="flex items-center gap-4 py-3">
            {desktopFilterBar}
          </PageMargin>
        </div>
      )}

      {(mobileBackTitle || mobileMenu) && (
        <div className="border-y border-[#e6e9ef] bg-white lg:hidden">
          <PageMargin className="flex h-12 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Kembali"
              className="-ml-2 size-8 shrink-0 rounded-full text-[#172033] hover:bg-[#f5f7fb]"
            >
              <ArrowLeft className="size-5" />
            </Button>
            {mobileBackTitle ? (
              <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-[#172033]">
                {mobileBackTitle}
              </h1>
            ) : (
              <div className="min-w-0 flex-1" />
            )}
            {mobileMenu && (
              <Dropdown
                align="right"
                panelClassName="w-56 rounded-xl"
                trigger={({ open, toggle }) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    aria-label={mobileMenuLabel}
                    aria-expanded={open}
                    className="-mr-2 size-8 shrink-0 rounded-full text-[#172033] hover:bg-[#f5f7fb]"
                  >
                    <EllipsisVertical className="size-5" />
                  </Button>
                )}
              >
                {mobileMenu}
              </Dropdown>
            )}
          </PageMargin>
        </div>
      )}
    </header>
  );
}
