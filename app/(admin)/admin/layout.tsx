import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/apis/session";

// Mirrors sevenpreneur's admin gating; no role_name union in lib/types.ts yet since the backend hasn't published its full role list.
const DEFAULT_MEMBER_ROLE_NAME = "General User";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, user } = await getSession();

  // next.config.mts already bounces logged-out admin-subdomain requests to login before this layout runs.
  if (!sessionToken) redirect("https://www.example.com/auth/login");

  if (!user?.role_name || user.role_name === DEFAULT_MEMBER_ROLE_NAME) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#f5f7fb] px-6 text-center">
        <p className="text-lg font-semibold text-[#172033]">Akses ditolak</p>
        <p className="text-sm text-[#5f6573]">
          Akun ini tidak memiliki akses ke panel admin.
        </p>
        <Link
          href="https://www.example.com"
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          Kembali ke HMI Connect
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
