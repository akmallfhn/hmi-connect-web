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
        "relative aspect-[85.6/54] w-full overflow-hidden bg-cover bg-center text-white shadow-xl shadow-primary/20",
        "max-w-[420px] rounded-2xl p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundImage: `url('${CARD_BACKGROUND_URL}')`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-black/50" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <LogoHmiConnectHorizontal
            colorPrimary="white"
            colorSecondary="white"
            className="h-6 w-auto opacity-95"
          />
          <div className="flex items-center gap-2">
            <span className="text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-xs">
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
          <div className="h-8 w-10 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 sm:h-9 sm:w-12" />
        </div>

        <div className="relative">
          <div className={locked ? "select-none blur-[6px]" : undefined}>
            <p className="font-mono text-lg tracking-[0.15em] text-white sm:text-xl">
              {formatCardNumber(memberCard)}
            </p>
            <p className="mt-2 truncate text-sm font-semibold uppercase tracking-wide text-white sm:text-base">
              {fullName}
            </p>
          </div>

          {locked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/25 lg:text-sm">
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
