import { NextResponse } from "next/server";
import { getVerificationCount } from "@/apis/stat";

// Backs the sidebar's live pending-verification badge; the backend enforces the scope's read rule.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organization_id") ?? undefined;
  const branchId = searchParams.get("branch_id") ?? undefined;

  if (organizationId && branchId) {
    return NextResponse.json(
      { data: null, message: "Scope verifikasi tidak valid." },
      { status: 400 },
    );
  }

  const data = await getVerificationCount(
    organizationId ? { organizationId } : branchId ? { branchId } : {},
  );

  if (!data) {
    return NextResponse.json(
      { data: null, message: "Jumlah verifikasi gagal dimuat." },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { data: { pending_count: data.pending_count } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
