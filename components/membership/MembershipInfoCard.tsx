import { CheckCircle2, XCircle } from "lucide-react";

interface MembershipInfoCardProps {
  coordinatingBodyName?: string;
  branchName?: string;
  chapterName?: string;
  isSubscribe: boolean;
  subscriptionEndedAt?: string;
}

function formatLongDate(value?: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#5f6573]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[#172033]">
        {value || "Belum tergabung"}
      </p>
    </div>
  );
}

export default function MembershipInfoCard({
  coordinatingBodyName,
  branchName,
  chapterName,
  isSubscribe,
  subscriptionEndedAt,
}: MembershipInfoCardProps) {
  const validUntil = formatLongDate(subscriptionEndedAt);

  return (
    <div className="w-full rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#172033]">Status Keanggotaan</p>

      <div className="mt-4 flex flex-col gap-4">
        <InfoRow label="Badko" value={coordinatingBodyName} />
        <InfoRow label="Cabang" value={branchName} />
        <InfoRow label="Komisariat" value={chapterName} />
      </div>

      <div className="mt-5 border-t border-[#e6e9ef] pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#5f6573]">
          Status Membership
        </p>
        {isSubscribe ? (
          <>
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <CheckCircle2 className="size-3.5" />
              Aktif
            </span>
            {validUntil && (
              <p className="mt-2 text-sm text-[#5f6573]">
                Berlaku sampai{" "}
                <span className="font-semibold text-[#172033]">
                  {validUntil}
                </span>
              </p>
            )}
          </>
        ) : (
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold text-[#5f6573]">
            <XCircle className="size-3.5" />
            Tidak Aktif
          </span>
        )}
      </div>
    </div>
  );
}
