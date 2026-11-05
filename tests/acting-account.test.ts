import assert from "node:assert/strict";
import test from "node:test";
import type { SessionUser } from "../apis/session";
import { resolveSelectedActingAccount } from "../lib/access";

const user: SessionUser = {
  id: "user-1",
  username: "kader",
  grants: [
    {
      id: "grant-1",
      entity_type: "branch",
      entity_id: "branch-1",
      capability: "manage",
    },
  ],
};

test("the selected cookie only resolves an exact current grant for its user", () => {
  assert.deepEqual(resolveSelectedActingAccount("user-1|branch:branch-1", user), {
    entityType: "branch",
    entityId: "branch-1",
  });
  assert.equal(resolveSelectedActingAccount("user-2|branch:branch-1", user), null);
  assert.equal(resolveSelectedActingAccount("user-1|branch:branch-2", user), null);
  assert.equal(resolveSelectedActingAccount("user-1|chapter:branch-1", user), null);
  assert.equal(resolveSelectedActingAccount("user-1|invalid:branch-1", user), null);
});

test("revocation, logout, and Super Admin without a grant fall back to user mode", () => {
  assert.equal(resolveSelectedActingAccount("user-1|branch:branch-1", null), null);
  assert.equal(
    resolveSelectedActingAccount("user-1|branch:branch-1", { ...user, grants: [] }),
    null,
  );
  assert.equal(
    resolveSelectedActingAccount("user-1|branch:branch-1", {
      ...user,
      role_name: "Super Admin",
      grants: [],
    }),
    null,
  );
});
