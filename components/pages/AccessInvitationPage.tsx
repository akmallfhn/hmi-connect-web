"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { AccessGrantEntry } from "@/apis/access-grants";
import { acceptAccessGrant } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import LogoHmiConnect from "../svg/LogoHmiConnect";

interface AccessInvitationPageProps {
  grant: AccessGrantEntry;
  entityLabel: string;
  // Resolved server-side — the admin origin comes from DOMAIN_MODE, which the browser can't read.
  dashboardUrl: string;
}

export default function AccessInvitationPage({
  grant,
  entityLabel,
  dashboardUrl,
}: AccessInvitationPageProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const alreadyAccepted = grant.status === "accepted";
  const scope = grant.entity_name
    ? `${entityLabel} ${grant.entity_name}`
    : entityLabel;

  async function handleAccept() {
    setIsAccepting(true);
    try {
      const result = await acceptAccessGrant(grant.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menerima undangan.");
        return;
      }

      toast.success(`Kamu sekarang admin ${scope}.`);
      // Hard navigation — the session still carries the pre-accept grants until it's re-fetched.
      window.location.href = dashboardUrl;
    } catch (err) {
      console.error("[AccessInvitationPage] accept invitation threw:", err);
      toast.error("Gagal menerima undangan.");
      setIsAccepting(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#f5f7fb] px-5 py-12">
      <LogoHmiConnect className="h-8 w-auto" />

      <section className="mt-6 w-full max-w-md rounded-2xl border border-[#e6e9ef] bg-white p-6 text-center sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          {alreadyAccepted ? (
            <CheckCircle2 className="size-7" />
          ) : (
            <ShieldCheck className="size-7" />
          )}
        </div>

        <h1 className="mt-5 text-xl font-bold text-[#172033]">
          {alreadyAccepted
            ? `Kamu sudah jadi admin ${entityLabel} ini`
            : `Kamu diundang sebagai Admin ${entityLabel}`}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-[#5f6573]">
          {alreadyAccepted ? (
            <>
              Undangan ini sudah kamu terima sebelumnya. Kamu bisa langsung
              membuka dashboard {scope}.
            </>
          ) : (
            <>
              {grant.granted_by_name ? (
                <>
                  <span className="font-semibold text-[#172033]">
                    {grant.granted_by_name}
                  </span>{" "}
                  mengundang kamu
                </>
              ) : (
                "Kamu diundang"
              )}{" "}
              untuk mengelola dashboard {scope} di HMI Connect.
            </>
          )}
        </p>

        <div className="mt-5 rounded-xl border border-[#e6e9ef] bg-[#f9fafc] px-4 py-3 text-left">
          <p className="text-[13px] text-[#5f6573]">Entitas yang dikelola</p>
          <p className="mt-0.5 text-[15px] font-bold text-[#172033]">{scope}</p>
        </div>

        {alreadyAccepted ? (
          <a href={dashboardUrl} className="mt-6 block">
            <Button variant="primary" size="lg" className="w-full">
              Buka Dashboard {entityLabel}
            </Button>
          </a>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={handleAccept}
              disabled={isAccepting}
              className="mt-6 w-full"
            >
              {isAccepting && <Loader2 className="size-4 animate-spin" />}
              {isAccepting ? "Memproses..." : "Terima"}
            </Button>
            <p className="mt-3 text-xs text-[#5f6573]">
              Akses baru aktif setelah kamu menerimanya.
            </p>
          </>
        )}

        <Link
          href="/"
          className="mt-4 inline-block text-sm font-semibold text-[#5f6573] hover:text-primary"
        >
          Kembali ke Beranda
        </Link>
      </section>
    </main>
  );
}
