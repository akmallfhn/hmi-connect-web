"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Avatar from "../common/Avatar";

interface ChatThreadHeaderProps {
  fullName: string;
  username?: string;
  avatar?: string;
  affiliation?: string;
}

export default function ChatThreadHeader({
  fullName,
  username,
  avatar,
  affiliation,
}: ChatThreadHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-[#e6e9ef] bg-white px-3 py-2.5 lg:h-[72px] lg:px-5 lg:py-0">
      <Link
        href="/chats"
        aria-label="Kembali ke pesan"
        className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-full text-[#172033] transition hover:bg-[#f5f7fb] lg:hidden"
      >
        <ArrowLeft className="size-5" />
      </Link>

      <Link
        href={username ? `/profile/${username}` : "#"}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 transition hover:bg-[#f5f7fb]"
      >
        <Avatar src={avatar} name={fullName} size={40} className="shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#172033]">{fullName}</p>
          {affiliation && <p className="truncate text-xs text-[#7b8190]">{affiliation}</p>}
        </div>
      </Link>
    </div>
  );
}
