"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { switchActingAccount } from "@/lib/actions";
import type { ActingEntityRef } from "@/lib/access";

export default function SwitchAccountButton({
  account,
  href,
  className,
  children,
}: {
  account: ActingEntityRef | null;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const [switching, setSwitching] = useState(false);

  async function handleSwitch() {
    if (switching) return;
    setSwitching(true);
    try {
      if (!(await switchActingAccount(account))) {
        toast.error("Akses akun tidak tersedia. Muat ulang halaman dan coba lagi.");
        return;
      }
      // A full navigation clears any prefetched RSC/client data from the previous identity.
      window.location.assign(href);
    } catch {
      toast.error("Gagal beralih akun. Coba lagi.");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <button type="button" onClick={handleSwitch} disabled={switching} className={className}>
      {children}
    </button>
  );
}
