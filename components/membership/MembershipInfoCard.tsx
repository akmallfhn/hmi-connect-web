import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import Label from "../common/Label";

interface MembershipInfoCardProps {
  coordinatingBodyName?: string;
  branchName?: string;
  chapterName?: string;
  isSubscribe: boolean;
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
}: MembershipInfoCardProps) {
  return (
    <div className="w-full rounded-2xl border border-[#e6e9ef] bg-white p-5">
      <p className="font-stack-sans-headline text-base font-medium text-[#172033]">
        Status Keanggotaan
      </p>

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
          <Label
            variant="green"
            icon={<IconCircleCheckFilled className="size-3.5" />}
            className="mt-1.5"
          >
            Aktif
          </Label>
        ) : (
          <Label
            variant="gray"
            icon={<IconCircleXFilled className="size-3.5" />}
            className="mt-1.5"
          >
            Tidak Aktif
          </Label>
        )}
      </div>
    </div>
  );
}
