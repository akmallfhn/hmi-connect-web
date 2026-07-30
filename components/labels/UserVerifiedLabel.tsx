import Label from "../common/Label";
import type { VerificationStatusEnum } from "@/lib/types";

// Filled blue seal + white checkmark — lucide's BadgeCheck can't do a two-tone fill/stroke split, so this is a custom SVG instead.
function VerifiedCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        fill="#164EA6"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UserVerifiedLabel({
  status,
}: {
  status: VerificationStatusEnum;
}) {
  if (status === "verified") {
    return (
      <Label variant="blue">
        <VerifiedCheckIcon className="size-3.5 shrink-0" />
        Terverifikasi
      </Label>
    );
  }

  if (status === "pending") {
    return <Label variant="yellow">Menunggu Review</Label>;
  }

  return <Label variant="gray">Belum Verifikasi</Label>;
}
