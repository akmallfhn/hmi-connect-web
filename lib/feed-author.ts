import type { Feed } from "@/apis/feeds";
import type { AccessEntityTypeEnum } from "@/lib/types";

// Public profile route per entity, one gated route each — see components/entity/*.
const ENTITY_PROFILE_BASE_PATH: Record<AccessEntityTypeEnum, string> = {
  organization: "/organizations",
  coordinating_body: "/coordinating-bodies",
  branch: "/branches",
  coordinating_chapter: "/coordinating-chapters",
  chapter: "/chapters",
};

// An organization is named outright; the other four read as "HMI Cabang Depok".
const ENTITY_NAME_PREFIX: Record<AccessEntityTypeEnum, string> = {
  organization: "",
  coordinating_body: "HMI Badko ",
  branch: "HMI Cabang ",
  coordinating_chapter: "HMI Korkom ",
  chapter: "HMI Komisariat ",
};

// Stored names may already carry the prefix, so strip it before adding one back.
const ENTITY_NAME_STRIP: Record<AccessEntityTypeEnum, RegExp | null> = {
  organization: null,
  coordinating_body: /^(?:hmi\s+)?badko\s+/i,
  branch: /^(?:hmi\s+)?cabang\s+/i,
  coordinating_chapter: /^(?:hmi\s+)?korkom\s+/i,
  chapter: /^(?:hmi\s+)?komisariat\s+/i,
};

export function formatEntityAuthorName(
  entityType: AccessEntityTypeEnum,
  name: string
): string {
  const strip = ENTITY_NAME_STRIP[entityType];
  const normalizedName = strip ? name.replace(strip, "").trim() : name.trim();
  return `${ENTITY_NAME_PREFIX[entityType]}${normalizedName || name}`;
}

export function entityProfileHref(
  entityType: AccessEntityTypeEnum,
  entityId: string
): string {
  return `${ENTITY_PROFILE_BASE_PATH[entityType]}/${entityId}`;
}

export type FeedAuthor = {
  name: string;
  avatar?: string;
  href: string;
  // Entity feeds are rendered under the entity's name and logo, not the human who pressed post.
  isEntity: boolean;
};

// Every feed-shaped payload the app renders an author for, including search's own posting row.
export type FeedAuthorSource = Pick<
  Feed,
  | "creator_full_name"
  | "creator_username"
  | "creator_avatar"
  | "author_entity_type"
  | "author_entity_id"
  | "author_entity_name"
  | "author_entity_image_url"
>;

export function resolveFeedAuthor(feed: FeedAuthorSource): FeedAuthor {
  if (feed.author_entity_type && feed.author_entity_id) {
    return {
      name: formatEntityAuthorName(
        feed.author_entity_type,
        feed.author_entity_name ?? ""
      ),
      avatar: feed.author_entity_image_url ?? undefined,
      href: entityProfileHref(feed.author_entity_type, feed.author_entity_id),
      isEntity: true,
    };
  }

  return {
    name: feed.creator_full_name,
    avatar: feed.creator_avatar,
    href: feed.creator_username ? `/profile/${feed.creator_username}` : "#",
    isEntity: false,
  };
}
