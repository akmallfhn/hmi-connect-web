import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconLock,
} from "@tabler/icons-react";
import Label from "../common/Label";

interface MembershipInfoCardProps {
  coordinatingBodyName?: string;
  branchName?: string;
  chapterName?: string;
  isSubscribe: boolean;
  locked?: boolean;
  className?: string;
}

function InfoRow({
  label,
  value,
  locked,
}: {
  label: string;
  value?: string;
  locked?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {/* A locked row shows placeholder dots, never a real value behind a blur. */}
      <p
        className={[
          "mt-0.5 text-sm font-semibold text-heading",
          locked ? "select-none blur-[5px]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {locked ? "••••••••••" : value || "Belum tergabung"}
      </p>
    </div>
  );
}

export default function MembershipInfoCard({
  coordinatingBodyName,
  branchName,
  chapterName,
  isSubscribe,
  locked,
  className,
}: MembershipInfoCardProps) {
  return (
    <div
      className={[
        "w-full rounded-2xl border border-border bg-surface p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="font-stack-sans-headline text-base font-medium text-heading">
        Status Keanggotaan
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <InfoRow label="Badko" value={coordinatingBodyName} locked={locked} />
        <InfoRow label="Cabang" value={branchName} locked={locked} />
        <InfoRow label="Komisariat" value={chapterName} locked={locked} />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Status Membership
        </p>
        {locked ? (
          <Label
            variant="gray"
            icon={<IconLock className="size-3.5" />}
            className="mt-1.5"
          >
            Terkunci
          </Label>
        ) : isSubscribe ? (
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
