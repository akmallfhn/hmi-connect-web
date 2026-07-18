import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { MembershipDetail } from "@/apis/users";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import MembershipCard from "../membership/MembershipCard";
import MembershipInfoCard from "../membership/MembershipInfoCard";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface MembershipPageProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
  membership: MembershipDetail | null;
}

export default function MembershipPage({
  fullName,
  avatar,
  email,
  userId,
  username,
  isVerified,
  membership,
}: MembershipPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={fullName}
        avatar={avatar}
        email={email}
        userId={userId}
        username={username}
        isVerified={isVerified}
        mobileBackTitle="E-KTA"
      />

      <PageMargin className="py-6">
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-[#172033]">E-KTA</h1>
          <p className="mt-1 text-sm text-[#5f6573]">
            Kartu Tanda Anggota digital kamu di HMI Connect.
          </p>
        </div>

        {membership?.member_card ? (
          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
            <MembershipCard
              fullName={membership.full_name}
              memberCard={membership.member_card}
            />
            <MembershipInfoCard
              coordinatingBodyName={membership.coordinating_body_name}
              branchName={membership.branch_name}
              chapterName={membership.chapter_name}
              isSubscribe={membership.is_subscribe}
              subscriptionEndedAt={membership.subscription_ended_at}
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#dbe3ef] bg-white px-6 py-12 text-center">
            <ShieldAlert className="size-10 text-destructive" />
            <div>
              <p className="font-semibold text-[#172033]">Belum Terverifikasi</p>
              <p className="mt-1 max-w-sm text-sm text-[#5f6573]">
                Verifikasi identitas kamu terlebih dahulu untuk mendapatkan Kartu Tanda
                Anggota digital.
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
