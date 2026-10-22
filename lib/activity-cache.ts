import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { Notification } from "@/apis/notifications";
import type { ConversationSummary } from "@/apis/chats";

export type ActivityPage<T> = { list: T[]; hasMore: boolean };
export type ActivityData<T> = InfiniteData<ActivityPage<T>, number>;
export type ConversationsData = ActivityData<ConversationSummary>;

export const activityKeys = {
  notifications: (userId?: string) => ["notifications", userId] as const,
  conversations: (userId?: string) => ["conversations", userId] as const,
  notificationRead: (userId?: string) => ["notification-read", userId] as const,
  conversationRead: (userId?: string) => ["conversation-read", userId] as const,
};

export function mapActivity<T>(
  data: ActivityData<T> | undefined,
  update: (item: T) => T,
) {
  return (
    data && {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        list: page.list.map(update),
      })),
    }
  );
}

export function uniqueActivityItems<T extends { id: string }>(
  data?: InfiniteData<ActivityPage<T>>,
): T[] {
  return Array.from(
    new Map(
      data?.pages.flatMap((page) => page.list).map((item) => [item.id, item]),
    ).values(),
  );
}

export async function readNotificationsInCache(
  client: QueryClient,
  userId: string | undefined,
  ids?: string[],
  initial?: ActivityData<Notification>,
) {
  const queryKey = activityKeys.notifications(userId);
  await client.cancelQueries({ queryKey });
  const previous =
    client.getQueryData<ActivityData<Notification>>(queryKey) ?? initial;
  const readAt = new Date().toISOString();
  const changedIds = uniqueActivityItems(previous)
    .filter((item) => !item.read_at && (!ids?.length || ids.includes(item.id)))
    .map((item) => item.id);
  client.setQueryData<ActivityData<Notification>>(queryKey, (data) =>
    mapActivity(data ?? initial, (item) =>
      changedIds.includes(item.id) ? { ...item, read_at: readAt } : item,
    ),
  );
  return { previous, readAt, changedIds };
}

export function restoreNotificationsInCache(
  client: QueryClient,
  userId: string | undefined,
  context?: Awaited<ReturnType<typeof readNotificationsInCache>>,
) {
  const previous = new Map(
    context?.previous?.pages
      .flatMap((page) => page.list)
      .map((item) => [item.id, item.read_at]),
  );
  client.setQueryData<ActivityData<Notification>>(
    activityKeys.notifications(userId),
    (data) =>
      mapActivity(data, (item) =>
        context?.changedIds.includes(item.id) &&
        item.read_at === context.readAt &&
        previous.has(item.id)
          ? { ...item, read_at: previous.get(item.id)! }
          : item,
      ),
  );
}

export async function readConversationInCache(
  client: QueryClient,
  userId: string | undefined,
  conversationId: string,
) {
  const queryKey = activityKeys.conversations(userId);
  await client.cancelQueries({ queryKey });
  const previous = uniqueActivityItems(
    client.getQueryData<ConversationsData>(queryKey),
  ).find((item) => item.id === conversationId);
  client.setQueryData<ConversationsData>(queryKey, (data) =>
    mapActivity(data, (item) =>
      item.id === conversationId ? { ...item, unread: false } : item,
    ),
  );
  return previous;
}

export function restoreConversationInCache(
  client: QueryClient,
  userId: string | undefined,
  previous?: ConversationSummary,
) {
  if (previous)
    client.setQueryData<ConversationsData>(
      activityKeys.conversations(userId),
      (data) =>
        mapActivity(data, (item) =>
          item.id === previous.id ? { ...item, unread: previous.unread } : item,
        ),
    );
}
