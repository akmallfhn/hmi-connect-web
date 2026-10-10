import { IconLock } from "@tabler/icons-react";
import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";
import LogoHmiOutline from "../svg/LogoHmiOutline";

export const CARD_BACKGROUND_URL =
  "/images/share/membership-card-background.jpg";

interface MembershipCardProps {
  fullName: string;
  memberCard?: string;
  locked?: boolean;
  className?: string;
}

export function formatCardNumber(memberCard?: string) {
  if (!memberCard) return "•••• •••• •••• ••••";
  return memberCard.replace(/(.{4})/g, "$1 ").trim();
}

export default function MembershipCard({
  fullName,
  memberCard,
  locked,
  className,
}: MembershipCardProps) {
  return (
    <div
      className={[
        "relative aspect-[85.6/54] w-full overflow-hidden bg-cover bg-center text-on-dark shadow-xl shadow-primary/20",
        "max-w-[420px] rounded-2xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundImage: `url('${CARD_BACKGROUND_URL}')`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-media-backdrop/50 via-media-backdrop/20 to-media-backdrop/50" />

      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <LogoHmiConnectHorizontal
            colorPrimary="white"
            colorSecondary="white"
            className="h-6 w-auto opacity-95"
          />
          <div className="flex items-center gap-2">
            <span className="text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-on-dark/80 sm:text-xs">
              Kartu Tanda
              <br />
              Anggota HMI
            </span>
            <LogoHmiOutline
              color="white"
              className="h-11 w-auto opacity-95 sm:h-12"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-10 rounded-md bg-gradient-to-br from-card-chip-start to-card-chip-end sm:h-9 sm:w-12" />
        </div>

        <div className="relative">
          <div className={locked ? "select-none blur-[6px]" : undefined}>
            <p className="font-mono text-lg tracking-[0.15em] text-on-dark sm:text-xl">
              {formatCardNumber(memberCard)}
            </p>
            <p className="mt-2 truncate text-sm font-semibold uppercase tracking-wide text-on-dark sm:text-base">
              {fullName}
            </p>
          </div>

          {locked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 rounded-full bg-media-backdrop/45 px-3 py-1.5 text-[13px] font-semibold text-on-dark ring-1 ring-on-dark/25 lg:text-sm">
                <IconLock className="size-4 shrink-0" stroke={2} />
                Menunggu verifikasi admin
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
