import LogoHmiConnect from "../svg/LogoHmiConnect";

interface MembershipCardProps {
  fullName: string;
  memberCard?: string;
}

function formatCardNumber(memberCard?: string) {
  if (!memberCard) return "•••• •••• •••• ••••";
  return memberCard.replace(/(.{4})/g, "$1 ").trim();
}

export default function MembershipCard({ fullName, memberCard }: MembershipCardProps) {
  return (
    <div className="relative aspect-[85.6/54] w-full max-w-[420px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-6 text-white shadow-xl shadow-primary/20">
      <div className="pointer-events-none absolute -right-10 -top-16 size-52 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <LogoHmiConnect
            colorPrimary="white"
            colorSecondary="white"
            className="h-6 w-auto opacity-95 sm:h-7"
          />
          <span className="text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-xs">
            Kartu Tanda
            <br />
            Anggota
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-10 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 sm:h-9 sm:w-12" />
        </div>

        <div>
          <p className="font-mono text-lg tracking-[0.15em] text-white sm:text-xl">
            {formatCardNumber(memberCard)}
          </p>
          <p className="mt-2 truncate text-sm font-semibold uppercase tracking-wide text-white sm:text-base">
            {fullName}
          </p>
        </div>
      </div>
    </div>
  );
}
