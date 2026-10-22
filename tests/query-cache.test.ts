import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import type { Notification } from "../apis/notifications";
import type { ConversationSummary } from "../apis/chats";
import {
  activityKeys,
  mapActivity,
  readNotificationsInCache,
  restoreNotificationsInCache,
  readConversationInCache,
  restoreConversationInCache,
  uniqueActivityItems,
  type ActivityData,
} from "../lib/activity-cache";
import {
  reviewVerificationInCache,
  restoreVerificationInCache,
  verificationCountKey,
} from "../lib/verification-cache";

function client() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
}

function notification(id: string, read_at: string | null = null): Notification {
  return {
    id,
    read_at,
    type: "follow",
    entity_type: "user",
    entity_id: "actor",
    actor_id: "actor",
    actor_full_name: "Kader",
    actor_username: "kader",
    entity_content: null,
    feed_id: null,
    created_at: "2026-10-22T00:00:00Z",
  };
}

function pages<T>(...lists: T[][]): ActivityData<T> {
  return {
    pages: lists.map((list, index) => ({
      list,
      hasMore: index < lists.length - 1,
    })),
    pageParams: lists.map((_, index) => index + 1),
  };
}

test("opening notifications clears every cached page and every observer immediately", async () => {
  const cache = client();
  const key = activityKeys.notifications("viewer");
  const original = pages(
    [notification("one")],
    [notification("two"), notification("read", "already-read")],
  );
  cache.setQueryData(key, original);
  const options = {
    queryKey: key,
    enabled: false,
    select: (data: ActivityData<Notification>) =>
      uniqueActivityItems(data).filter((item) => !item.read_at).length,
  };
  const desktop = new QueryObserver(cache, options);
  const mobile = new QueryObserver(cache, options);
  const stopDesktop = desktop.subscribe(() => {});
  const stopMobile = mobile.subscribe(() => {});
  await readNotificationsInCache(cache, "viewer");
  const current = cache.getQueryData<ActivityData<Notification>>(key)!;
  assert.equal(
    uniqueActivityItems(current).filter((item) => !item.read_at).length,
    0,
  );
  assert.equal(current.pages[1].list[1].read_at, "already-read");
  assert.deepEqual(current.pageParams, [1, 2]);
  assert.equal(original.pages[0].list[0].read_at, null);
  assert.equal(desktop.getCurrentResult().data, 0);
  assert.equal(mobile.getCurrentResult().data, 0);
  stopDesktop();
  stopMobile();
});

test("failed notification read restores only its own rows and keeps another successful action", async () => {
  const cache = client();
  const key = activityKeys.notifications("viewer");
  cache.setQueryData(key, pages([notification("one"), notification("two")]));
  const failed = await readNotificationsInCache(cache, "viewer", ["one"]);
  await readNotificationsInCache(cache, "viewer", ["two"]);
  restoreNotificationsInCache(cache, "viewer", failed);
  const rows = uniqueActivityItems(
    cache.getQueryData<ActivityData<Notification>>(key),
  );
  assert.equal(rows[0].read_at, null);
  assert.ok(rows[1].read_at);
});

test("notification cache is isolated per signed-in viewer", async () => {
  const cache = client();
  for (const id of ["first", "second"])
    cache.setQueryData(
      activityKeys.notifications(id),
      pages([notification("one")]),
    );
  await readNotificationsInCache(cache, "first", []);
  assert.equal(
    cache.getQueryData<ActivityData<Notification>>(
      activityKeys.notifications("second"),
    )!.pages[0].list[0].read_at,
    null,
  );
});

test("a cold notification page seeds its cache before marking it read", async () => {
  const cache = client();
  const context = await readNotificationsInCache(
    cache,
    "viewer",
    undefined,
    pages([notification("one")]),
  );
  assert.ok(
    cache.getQueryData<ActivityData<Notification>>(
      activityKeys.notifications("viewer"),
    )!.pages[0].list[0].read_at,
  );
  restoreNotificationsInCache(cache, "viewer", context);
  assert.equal(
    cache.getQueryData<ActivityData<Notification>>(
      activityKeys.notifications("viewer"),
    )!.pages[0].list[0].read_at,
    null,
  );
});

test("a late list response cannot overwrite an optimistic read", async () => {
  const cache = client();
  const key = activityKeys.notifications("viewer");
  let resolve!: (data: ActivityData<Notification>) => void;
  const observer = new QueryObserver(cache, {
    queryKey: key,
    queryFn: () =>
      new Promise<ActivityData<Notification>>((done) => {
        resolve = done;
      }),
  });
  const unsubscribe = observer.subscribe(() => {});
  await readNotificationsInCache(
    cache,
    "viewer",
    undefined,
    pages([notification("one")]),
  );
  resolve(pages([notification("one")]));
  await new Promise((done) => setTimeout(done, 0));
  assert.ok(
    cache.getQueryData<ActivityData<Notification>>(key)!.pages[0].list[0]
      .read_at,
  );
  unsubscribe();
});

test("reading a thread updates the shared badge and rollback preserves other threads", async () => {
  const cache = client();
  const key = activityKeys.conversations("viewer");
  const conversation = (id: string): ConversationSummary => ({
    id,
    unread: true,
    other_user_id: id,
    other_full_name: id,
    other_username: id,
    created_at: "2026-10-22T00:00:00Z",
  });
  cache.setQueryData(key, pages([conversation("one"), conversation("two")]));
  const previous = await readConversationInCache(cache, "viewer", "one");
  await readConversationInCache(cache, "viewer", "two");
  restoreConversationInCache(cache, "viewer", previous);
  const rows = uniqueActivityItems(
    cache.getQueryData<ActivityData<ConversationSummary>>(key),
  );
  assert.deepEqual(
    rows.map((row) => row.unread),
    [true, false],
  );
});

test("verification review decrements global, organization, and matching branch counts only", async () => {
  const cache = client();
  const scopes = [
    {},
    { organizationId: "org" },
    { branchId: "one" },
    { branchId: "two" },
  ];
  for (const scope of scopes)
    cache.setQueryData([...verificationCountKey, scope], 2);
  const affected = await reviewVerificationInCache(cache, "one");
  assert.deepEqual(
    scopes.map((scope) => cache.getQueryData([...verificationCountKey, scope])),
    [1, 1, 1, 2],
  );
  restoreVerificationInCache(cache, affected);
  assert.deepEqual(
    scopes.map((scope) => cache.getQueryData([...verificationCountKey, scope])),
    [2, 2, 2, 2],
  );
});

test("verification rollback does not undo a separate successful review or increase zero counts", async () => {
  const cache = client();
  const key = [...verificationCountKey, {}];
  cache.setQueryData(key, 2);
  const failed = await reviewVerificationInCache(cache);
  await reviewVerificationInCache(cache);
  restoreVerificationInCache(cache, failed);
  assert.equal(cache.getQueryData(key), 1);
  cache.setQueryData(key, 0);
  restoreVerificationInCache(cache, await reviewVerificationInCache(cache));
  assert.equal(cache.getQueryData(key), 0);
});

test("paginated activity deduplication keeps pagination intact during updates", () => {
  const original = pages(
    [notification("one")],
    [notification("one"), notification("two")],
  );
  const updated = mapActivity(original, (row) => ({
    ...row,
    read_at: "read",
  }))!;
  assert.deepEqual(
    uniqueActivityItems(updated).map((row) => row.id),
    ["one", "two"],
  );
  assert.equal(updated.pages[0].hasMore, true);
  assert.equal(original.pages[0].list[0].read_at, null);
});
