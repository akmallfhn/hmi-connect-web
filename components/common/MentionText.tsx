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
        <span key={`${segment.username}-${index}`} className={className}>
          {segment.value}
        </span>
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
