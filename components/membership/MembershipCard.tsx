import LogoHmiConnectHorizontal from "../svg/LogoHmiConnectHorizontal";
import LogoHmiOutline from "../svg/LogoHmiOutline";

const CARD_BACKGROUND_ALT_1 =
  "https://i.pinimg.com/control1/1200x/e3/ca/0c/e3ca0cc8f9286a48d5a6a3ca7f197595.jpg";
const CARD_BACKGROUND_ALT_2 =
  "https://i.pinimg.com/control1/1200x/0f/bb/4a/0fbb4a69d0a22bfed97a44f59a67539e.jpg";
const CARD_BACKGROUND_ALT_3 =
  "https://i.pinimg.com/1200x/57/d6/dc/57d6dc0ea08d6cf6ba5d1e21d4d7db9c.jpg";

const CARD_BACKGROUND_URL = CARD_BACKGROUND_ALT_3;

interface MembershipCardProps {
  fullName: string;
  memberCard?: string;
}

function formatCardNumber(memberCard?: string) {
  if (!memberCard) return "•••• •••• •••• ••••";
  return memberCard.replace(/(.{4})/g, "$1 ").trim();
}

export default function MembershipCard({
  fullName,
  memberCard,
}: MembershipCardProps) {
  return (
    <div
      className="relative aspect-[85.6/54] w-full max-w-[420px] overflow-hidden rounded-2xl bg-cover bg-center p-6 text-white shadow-xl shadow-primary/20"
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
