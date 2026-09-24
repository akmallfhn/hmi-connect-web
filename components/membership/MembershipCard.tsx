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
  variant?: "default" | "compact" | "share";
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
  variant = "default",
}: MembershipCardProps) {
  const isCompact = variant !== "default";
  const isShare = variant === "share";

  return (
    <div
      className={[
        "relative aspect-[85.6/54] w-full overflow-hidden bg-cover bg-center text-white shadow-xl shadow-primary/20",
        isCompact
          ? "max-w-none rounded-xl p-4"
          : "max-w-[420px] rounded-2xl p-6",
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
            className={["w-auto opacity-95", isCompact ? "h-4" : "h-6"].join(
              " "
            )}
          />
          <div className="flex items-center gap-2">
            <span
              className={[
                "text-right font-semibold uppercase tracking-[0.2em] text-white/80",
                isCompact ? "text-[8px]" : "text-[10px] sm:text-xs",
              ].join(" ")}
            >
              Kartu Tanda
              <br />
              Anggota HMI
            </span>
            <LogoHmiOutline
              color="white"
              className={[
                "w-auto opacity-95",
                isCompact ? "h-8" : "h-11 sm:h-12",
              ].join(" ")}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={[
              "rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400",
              isShare ? "lg:rounded-sm" : "",
              isShare
                ? "h-6 w-8 lg:h-4 lg:w-6"
                : isCompact
                  ? "h-6 w-8"
                  : "h-8 w-10 sm:h-9 sm:w-12",
            ].join(" ")}
          />
        </div>

        <div className="relative">
          <div className={locked ? "select-none blur-[6px]" : undefined}>
            <p
              className={[
                "font-mono tracking-[0.15em] text-white",
                isCompact ? "text-sm" : "text-lg sm:text-xl",
              ].join(" ")}
            >
              {formatCardNumber(memberCard)}
            </p>
            <p
              className={[
                "truncate font-semibold uppercase tracking-wide text-white",
                isCompact ? "mt-1.5 text-xs" : "mt-2 text-sm sm:text-base",
              ].join(" ")}
            >
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
