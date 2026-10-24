import { USERNAME_PATTERN } from "./username";

export type MentionSegment =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; username: string }
  | { type: "hashtag"; value: string; name: string };

export type ActiveSocialToken = {
  type: "mention" | "hashtag";
  start: number;
  end: number;
  query: string;
};

const MENTION_QUERY_PATTERN = /(^|[^A-Za-z0-9._])@([A-Za-z0-9._]*)$/u;
const HASHTAG_QUERY_PATTERN = /(^|[^A-Za-z0-9_])#([A-Za-z0-9_]*)$/u;

function mentionPattern() {
  return new RegExp(
    `(^|[^A-Za-z0-9._])@(${USERNAME_PATTERN})|(^|[^A-Za-z0-9_])#([A-Za-z0-9_]+)`,
    "gu",
  );
}

export function parseMentions(value: string): MentionSegment[] {
  const segments: MentionSegment[] = [];
  let cursor = 0;

  for (const match of value.matchAll(mentionPattern())) {
    const username = match[2];
    const hashtag = match[4];
    const boundary = username ? (match[1] ?? "") : (match[3] ?? "");
    const matchIndex = match.index ?? 0;
    const tokenStart = matchIndex + boundary.length;

    if (tokenStart > cursor) {
      segments.push({ type: "text", value: value.slice(cursor, tokenStart) });
    }
    if (username) {
      segments.push({ type: "mention", value: `@${username}`, username });
      cursor = tokenStart + username.length + 1;
    } else {
      segments.push({ type: "hashtag", value: `#${hashtag}`, name: hashtag.toLowerCase() });
      cursor = tokenStart + hashtag.length + 1;
    }
  }

  if (cursor < value.length) {
    segments.push({ type: "text", value: value.slice(cursor) });
  }

  return segments;
}

export function activeSocialTokenAt(value: string, caret: number): ActiveSocialToken | null {
  const beforeCaret = value.slice(0, caret);
  const mentionMatch = MENTION_QUERY_PATTERN.exec(beforeCaret);
  const hashtagMatch = HASHTAG_QUERY_PATTERN.exec(beforeCaret);
  const match = mentionMatch ?? hashtagMatch;
  if (!match) return null;

  const query = match[2];
  const start = caret - query.length - 1;
  return { type: mentionMatch ? "mention" : "hashtag", start, end: caret, query };
}

export function replaceActiveSocialToken(
  value: string,
  token: ActiveSocialToken,
  replacement: string,
) {
  const prefix = token.type === "mention" ? "@" : "#";
  const inserted = `${prefix}${replacement}${/^\s/u.test(value.slice(token.end)) ? "" : " "}`;
  return {
    value: `${value.slice(0, token.start)}${inserted}${value.slice(token.end)}`,
    caret: token.start + inserted.length,
  };
}
