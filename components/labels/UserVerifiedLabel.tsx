import type { VerificationStatusEnum } from "@/lib/types";
import Label from "../common/Label";
import VerifiedBadge from "../common/VerifiedBadge";

export default function UserVerifiedLabel({
  status,
}: {
  status: VerificationStatusEnum;
}) {
  if (status === "verified") {
    // The same badge ProfileHeader's name row shows, so one person is marked identically everywhere.
    return (
      <Label variant="gray" icon={<VerifiedBadge size={14} />}>
        Terverifikasi
      </Label>
    );
  }

  if (status === "pending") {
    return <Label variant="yellow">Menunggu Review</Label>;
  }

  return <Label variant="red">Tidak Terverifikasi</Label>;
}
