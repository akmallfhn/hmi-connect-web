"use client";

import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import Avatar from "../common/Avatar";

interface ChatThreadHeaderProps {
  fullName: string;
  username?: string;
  avatar?: string;
}

export default function ChatThreadHeader({
  fullName,
  username,
  avatar,
}: ChatThreadHeaderProps) {
  return (
    <div className="flex shrink-0 flex-col border-b border-[#e6e9ef] bg-white">
      <div className="flex items-center gap-1 px-3 py-2.5 lg:h-[72px] lg:px-5 lg:py-0">
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
          <Avatar src={avatar} name={fullName} size={34} className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#172033]">
              {fullName}
            </p>
            {username && (
              <p className="truncate text-xs text-[#7b8190]">@{username}</p>
            )}
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-[#e6e9ef] bg-[#f8fafb] px-3 py-1.5">
        <Lock className="size-3 shrink-0 text-[#9aa1ad]" />
        <p className="text-center text-[11px] text-[#9aa1ad]">
          Pesan di percakapan ini terenkripsi end-to-end
        </p>
      </div>
    </div>
  );
}
