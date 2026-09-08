import Image from "next/image";
import { Check } from "lucide-react";
import Avatar from "../common/Avatar";
import LogoHmi from "../svg/LogoHmi";
import type { FeedAuthor } from "@/lib/feed-author";

interface FeedAuthorAvatarProps {
  author: FeedAuthor;
  size?: number;
  className?: string;
}

// An entity author wears the same ringed logo treatment as its own profile header.
export default function FeedAuthorAvatar({
  author,
  size = 44,
  className,
}: FeedAuthorAvatarProps) {
  if (!author.isEntity) {
    return (
      <Avatar
        src={author.avatar}
        name={author.name}
        size={size}
        className={className}
      />
    );
  }

  // The check has to stay legible down to a 24px quoted-feed avatar, hence the floor.
  const badgeSize = Math.max(12, Math.round(size * 0.36));
  const badgeBorder = size >= 36 ? 2 : 1.5;

  return (
    <span
      style={{ width: size, height: size }}
      className={`relative block shrink-0 ${className ?? ""}`}
    >
      <span
        style={{ width: size, height: size }}
        className="flex items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#f5f7fb] ring-2 ring-primary"
      >
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name}
            width={size}
            height={size}
            className="h-full w-full object-cover"
          />
        ) : (
          <LogoHmi style={{ width: size * 0.5, height: size * 0.5 }} />
        )}
      </span>

      {/* Same official marker as the entity profile header, so the logo alone identifies the account. */}
      <span
        aria-label="Official Account"
        title="Official Account"
        style={{
          width: badgeSize,
          height: badgeSize,
          borderWidth: badgeBorder,
        }}
        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-white bg-primary text-white"
      >
        <Check
          style={{ width: badgeSize * 0.6, height: badgeSize * 0.6 }}
          strokeWidth={4}
        />
      </span>
    </span>
  );
}
