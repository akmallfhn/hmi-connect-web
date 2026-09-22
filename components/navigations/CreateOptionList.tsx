"use client";

import { IconArticle, IconMessage2 } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { COMPOSE_INTENT_KEY } from "@/lib/constants";

type CreateOptionKind = "feed" | "article";

const CREATE_OPTIONS: {
  kind: CreateOptionKind;
  label: string;
  description: string;
  icon: typeof IconArticle;
}[] = [
  {
    kind: "feed",
    label: "Feed",
    description: "Kabar singkat, foto, atau tautan.",
    icon: IconMessage2,
  },
  {
    kind: "article",
    label: "Artikel",
    description: "Tulisan panjang dengan cover.",
    icon: IconArticle,
  },
];

interface CreateOptionListProps {
  onSelected?: () => void;
  className?: string;
}

// Shared by the desktop rail's Create dropdown and BottomNav's Posting sheet, so one choice reads the same in both.
export default function CreateOptionList({
  onSelected,
  className,
}: CreateOptionListProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  function handleSelect(kind: CreateOptionKind) {
    onSelected?.();

    if (kind === "article") {
      router.push("/articles/create");
      return;
    }

    // FeedTimeline only listens on the home feed, so the flag has to survive the trip there.
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    if (pathname === "/") {
      window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
      return;
    }
    router.push("/");
  }

  return (
    <div className={className}>
      {CREATE_OPTIONS.map(({ kind, label, description, icon: Icon }) => (
        <button
          key={kind}
          type="button"
          onClick={() => handleSelect(kind)}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[#f5f7fb]"
        >
          <Icon className="size-4 shrink-0 text-[#5f6573]" stroke={2} />
          <span className="min-w-0">
            <span className="block text-sm text-[#172033]">{label}</span>
            <span className="block truncate text-xs text-[#8a909d]">
              {description}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
