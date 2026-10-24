import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activeSocialTokenAt,
  parseMentions,
  replaceActiveSocialToken,
} from "../lib/mentions";

test("social text parses mentions and canonical hashtag links", () => {
  assert.deepEqual(parseMentions("Halo @akmal #Kaderisasi!"), [
    { type: "text", value: "Halo " },
    { type: "mention", value: "@akmal", username: "akmal" },
    { type: "text", value: " " },
    { type: "hashtag", value: "#Kaderisasi", name: "kaderisasi" },
    { type: "text", value: "!" },
  ]);
});

test("hashtag autocomplete replaces the active token in lowercase", () => {
  const value = "Ikut #Kad";
  const token = activeSocialTokenAt(value, value.length);
  assert.deepEqual(token, {
    type: "hashtag",
    start: 5,
    end: value.length,
    query: "Kad",
  });
  assert.deepEqual(replaceActiveSocialToken(value, token!, "kaderisasi"), {
    value: "Ikut #kaderisasi ",
    caret: 17,
  });
});
