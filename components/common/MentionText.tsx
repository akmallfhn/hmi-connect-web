"use client";

import Link from "next/link";
import { useActingHref } from "@/hooks/useActingEntity";
import { parseMentions } from "@/lib/mentions";

interface MentionTextProps {
  children: string;
  interactive?: boolean;
}

export default function MentionText({
  children,
  interactive = true,
}: MentionTextProps) {
  const actingHref = useActingHref();

  return parseMentions(children).map((segment, index) => {
    if (segment.type === "text") return segment.value;

    const className = "font-medium text-primary-foreground hover:underline";
    if (!interactive) {
      return (
        <span key={`${segment.value}-${index}`} className={className}>
          {segment.value}
        </span>
      );
    }

    if (segment.type === "hashtag") {
      const params = new URLSearchParams({
        q: `#${segment.name}`,
        tab: "feed",
      });
      return (
        <Link
          key={`${segment.name}-${index}`}
          href={actingHref(`/search?${params}`)}
          className={className}
        >
          {segment.value}
        </Link>
      );
    }

    return (
      <Link
        key={`${segment.username}-${index}`}
        href={actingHref(`/profile/${encodeURIComponent(segment.username)}`)}
        className={className}
      >
        {segment.value}
      </Link>
    );
  });
}
