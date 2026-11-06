import assert from "node:assert/strict";
import test from "node:test";
import { allowedTrainingLevels } from "../lib/training-levels";

test("official account levels mirror the backend organizer policy", () => {
  assert.deepEqual(allowedTrainingLevels("chapter"), ["LK1"]);
  assert.deepEqual(allowedTrainingLevels("coordinating_chapter"), ["LK1", "LK2"]);
  assert.deepEqual(allowedTrainingLevels("branch"), ["LK2"]);
  assert.deepEqual(allowedTrainingLevels("coordinating_body"), ["LK3"]);
  assert.deepEqual(allowedTrainingLevels("organization"), ["LK3"]);
  assert.deepEqual(allowedTrainingLevels("special_body", "bpl", "organization"), ["SC"]);
  assert.deepEqual(allowedTrainingLevels("special_body", "kohati", "branch"), ["LKK", "LKSG"]);
  assert.deepEqual(allowedTrainingLevels("special_body", "kohati", "chapter"), []);
  assert.deepEqual(allowedTrainingLevels("special_body", "lpp", "branch"), []);
});
