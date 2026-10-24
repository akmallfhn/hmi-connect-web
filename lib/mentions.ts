import { USERNAME_PATTERN } from "./username";

export type MentionSegment =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; username: string };

export type ActiveMention = {
  start: number;
  end: number;
  query: string;
};

const MENTION_QUERY_PATTERN = /(^|[^A-Za-z0-9._])@([A-Za-z0-9._]*)$/u;

function mentionPattern() {
  return new RegExp(`(^|[^A-Za-z0-9._])@(${USERNAME_PATTERN})`, "gu");
}

export function parseMentions(value: string): MentionSegment[] {
  const segments: MentionSegment[] = [];
  let cursor = 0;

  for (const match of value.matchAll(mentionPattern())) {
    const boundary = match[1] ?? "";
    const username = match[2];
    const matchIndex = match.index ?? 0;
    const mentionStart = matchIndex + boundary.length;

    if (mentionStart > cursor) {
      segments.push({ type: "text", value: value.slice(cursor, mentionStart) });
    }
    segments.push({
      type: "mention",
      value: `@${username}`,
      username,
    });
    cursor = mentionStart + username.length + 1;
  }

  if (cursor < value.length) {
    segments.push({ type: "text", value: value.slice(cursor) });
  }

  return segments;
}

export function activeMentionAt(value: string, caret: number): ActiveMention | null {
  const beforeCaret = value.slice(0, caret);
  const match = MENTION_QUERY_PATTERN.exec(beforeCaret);
  if (!match) return null;

  const query = match[2];
  const start = caret - query.length - 1;
  return { start, end: caret, query };
}

export function replaceActiveMention(
  value: string,
  mention: ActiveMention,
  username: string,
) {
  const inserted = `@${username}${/^\s/u.test(value.slice(mention.end)) ? "" : " "}`;
  return {
    value: `${value.slice(0, mention.start)}${inserted}${value.slice(mention.end)}`,
    caret: mention.start + inserted.length,
  };
}
