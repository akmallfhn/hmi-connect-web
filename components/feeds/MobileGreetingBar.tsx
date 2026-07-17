import Link from "next/link";
import Avatar from "../common/Avatar";

interface MobileGreetingBarProps {
  fullName?: string;
  avatar?: string;
  username?: string;
}

export default function MobileGreetingBar({
  fullName,
  avatar,
  username,
}: MobileGreetingBarProps) {
  const displayName = fullName ?? "Kader";
  const profileHref = username ? `/profile/${username}` : "#";

  return (
    <div className="bg-primary px-4 pb-20 pt-4 lg:hidden">
      <Link href={profileHref} className="flex min-w-0 items-center gap-3">
        <Avatar src={avatar} name={displayName} size={44} className="ring-2 ring-white/30" />
        <div className="min-w-0">
          <p className="text-xs text-white/80">Welcome!</p>
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
        </div>
      </Link>
    </div>
  );
}
