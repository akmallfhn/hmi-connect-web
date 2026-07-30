import type { VerificationRequestStatusEnum } from "@/lib/types";
import Label, { type LabelVariant } from "../common/Label";

const STATUS_STYLES: Record<
  VerificationRequestStatusEnum,
  { variant: LabelVariant; label: string }
> = {
  pending: { variant: "orange", label: "Menunggu Review" },
  approved: { variant: "green", label: "Disetujui" },
  rejected: { variant: "red", label: "Ditolak" },
};

export default function VerificationRequestStatusLabel({
  status,
}: {
  status: VerificationRequestStatusEnum;
}) {
  const { variant, label } = STATUS_STYLES[status];

  return <Label variant={variant}>{label}</Label>;
}
