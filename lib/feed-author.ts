import type { Feed, FeedComment } from "@/apis/feeds";
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

// Strips every leading "HMI Badko"/"Cabang"/... the typist repeated, so only the bare name reaches the backend.
export function stripEntityNamePrefix(
  entityType: AccessEntityTypeEnum,
  name: string
): string {
  const strip = ENTITY_NAME_STRIP[entityType];
  let normalized = name.trim();
  if (!strip) return normalized;
  while (strip.test(normalized)) {
    const next = normalized.replace(strip, "").trim();
    if (next === normalized) break;
    normalized = next;
  }
  return normalized;
}

export function formatEntityAuthorName(
  entityType: AccessEntityTypeEnum,
  name: string
): string {
  const normalizedName = stripEntityNamePrefix(entityType, name);
  return `${ENTITY_NAME_PREFIX[entityType]}${normalizedName || name.trim()}`;
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

export type EntityAuthorSource = {
  author_entity_type?: AccessEntityTypeEnum | null;
  author_entity_id?: string | null;
  author_entity_name?: string | null;
  author_entity_image_url?: string | null;
};

// Comments, replies, and reactors only need this entity subset. Their API
// responses may not include the resolved name/logo yet, so retain a truthful
// official-account fallback instead of rendering the administrator as author.
export function resolveEntityAuthor(
  source: EntityAuthorSource,
): FeedAuthor | null {
  if (!source.author_entity_type || !source.author_entity_id) return null;

  return {
    name: source.author_entity_name
      ? formatEntityAuthorName(
          source.author_entity_type,
          source.author_entity_name,
        )
      : "Akun resmi",
    avatar: source.author_entity_image_url ?? undefined,
    href: entityProfileHref(
      source.author_entity_type,
      source.author_entity_id,
    ),
    isEntity: true,
  };
}

// Every feed-shaped payload the app renders an author for, including search's own posting row.
export type FeedAuthorSource = Pick<
  Feed,
  "creator_full_name" | "creator_username" | "creator_avatar"
> &
  EntityAuthorSource;

export function resolveFeedAuthor(feed: FeedAuthorSource): FeedAuthor {
  const entityAuthor = resolveEntityAuthor(feed);
  if (entityAuthor) return entityAuthor;

  return {
    name: feed.creator_full_name,
    avatar: feed.creator_avatar,
    href: feed.creator_username ? `/profile/${feed.creator_username}` : "#",
    isEntity: false,
  };
}

export type CommentAuthorSource = Pick<
  FeedComment,
  | "full_name"
  | "username"
  | "avatar"
  | "author_entity_type"
  | "author_entity_id"
  | "author_entity_name"
  | "author_entity_image_url"
>;

export function resolveCommentAuthor(comment: CommentAuthorSource): FeedAuthor {
  const entityAuthor = resolveEntityAuthor(comment);
  if (entityAuthor) return entityAuthor;

  return {
    name: comment.full_name,
    avatar: comment.avatar,
    href: comment.username ? `/profile/${comment.username}` : "#",
    isEntity: false,
  };
}
