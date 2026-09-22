import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { MembershipDetail } from "@/apis/users";
import type { VerificationStatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import MembershipCard from "../membership/MembershipCard";
import MembershipInfoCard from "../membership/MembershipInfoCard";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

const CARD_GRID_CLASS =
  "mt-6 flex flex-col items-center gap-6 lg:grid lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start";

interface MembershipPageProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
  membership: MembershipDetail | null;
}

export default function MembershipPage({
  fullName,
  avatar,
  email,
  userId,
  username,
  verificationStatus,
  membership,
}: MembershipPageProps) {
  const locked = verificationStatus === "pending";

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={fullName}
        avatar={avatar}
        email={email}
        userId={userId}
        username={username}
        verificationStatus={verificationStatus}
        mobileBackTitle="E-Kartu Tanda Anggota"
      />

      <PageMargin className="py-6">
        <div className="hidden lg:block">
          <h1 className="font-stack-sans-headline text-2xl font-medium text-[#172033]">
            E-Kartu Tanda Anggota
          </h1>
        </div>

        {membership?.member_card ? (
          <div className={CARD_GRID_CLASS}>
            <MembershipCard
              fullName={membership.ktp_full_name || membership.full_name}
              memberCard={membership.member_card}
            />
            <MembershipInfoCard
              coordinatingBodyName={membership.coordinating_body_name}
              branchName={membership.branch_name}
              chapterName={membership.chapter_name}
              isSubscribe={membership.is_subscribe}
            />
          </div>
        ) : locked ? (
          <div className={CARD_GRID_CLASS}>
            <MembershipCard locked fullName={fullName ?? ""} />
            <MembershipInfoCard locked isSubscribe={false} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#dbe3ef] bg-white px-6 py-12 text-center">
            <ShieldAlert className="size-10 text-destructive" />
            <div>
              <p className="font-semibold text-[#172033]">
                Belum Terverifikasi
              </p>
              <p className="mt-1 max-w-sm text-sm text-[#5f6573]">
                Verifikasi identitas kamu terlebih dahulu untuk mendapatkan
                Kartu Tanda Anggota digital.
              </p>
            </div>
            <Link href="/verification">
              <Button variant="primary">Verifikasi Sekarang</Button>
            </Link>
          </div>
        )}
      </PageMargin>

      <BottomNav userId={userId} username={username} />
    </div>
  );
}
