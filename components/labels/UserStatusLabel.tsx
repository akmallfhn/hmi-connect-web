import type { UserStatusEnum } from "@/lib/types";
import Label, { type LabelVariant } from "../common/Label";

const STATUS_STYLES: Record<UserStatusEnum, { variant: LabelVariant; label: string }> = {
  active: { variant: "green", label: "Aktif" },
  pending: { variant: "orange", label: "Pending" },
  inactive: { variant: "red", label: "Tidak Aktif" },
};

export default function UserStatusLabel({ status }: { status: UserStatusEnum }) {
  const { variant, label } = STATUS_STYLES[status];

  return (
    <Label variant={variant}>
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {label}
    </Label>
  );
}
