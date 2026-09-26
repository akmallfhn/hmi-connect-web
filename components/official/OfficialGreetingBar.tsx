import Image from "next/image";
import Link from "next/link";
import LogoHmi from "../svg/LogoHmi";

interface OfficialGreetingBarProps {
  name: string;
  imageUrl?: string | null;
  profileHref: string;
}

// The home greeting's twin, set on dark navy so an admin can tell at a glance they speak as the entity.
export default function OfficialGreetingBar({
  name,
  imageUrl,
  profileHref,
}: OfficialGreetingBarProps) {
  return (
    <div className="relative z-0 overflow-hidden bg-tertiary px-4 pb-20 pt-4 lg:hidden">
      <div className="pointer-events-none absolute -left-14 -top-16 size-56 rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -top-20 size-52 rounded-full bg-secondary/30 blur-3xl" />

      <Link
        href={profileHref}
        className="relative z-10 flex min-w-0 items-center gap-3"
      >
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/30">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <LogoHmi className="size-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-snug text-white">
            Hi, {name}!
          </p>
          <p className="truncate text-[13px] leading-snug text-white/70">
            Kamu sedang memakai akun resmi.
          </p>
        </div>
      </Link>
    </div>
  );
}
