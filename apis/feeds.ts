import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type FeedMediaTypeEnum, type ReactionTypeEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type FeedReactionCount = {
  total: number;
  by_type?: Partial<Record<ReactionTypeEnum, number>>;
};

export type FeedMedia = {
  id: string;
  type: FeedMediaTypeEnum;
  url: string;
  index: number;
};

export type Feed = {
  id: string;
  creator_id: string;
  creator_full_name: string;
  creator_avatar?: string;
  content: string;
  media?: FeedMedia[];
  repost_of_id?: string;
  repost_of?: Feed;
  reaction_count: FeedReactionCount;
  my_reaction: ReactionTypeEnum | null;
  comment_count: number;
  comment_reply_count: number;
  top_comment: FeedComment | null;
  created_at: string;
  updated_at: string;
};

export type FeedTimelineItem =
  | {
      type: "repost";
      created_at: string;
      reposter_id: string;
      reposter_full_name: string;
      reposter_avatar?: string;
      feed: Feed;
    }
  | {
      type: "feed";
      created_at: string;
      feed: Feed;
    };

export type CreateFeedPayload = {
  content: string;
  media?: {
    type: FeedMediaTypeEnum;
    urls: string[];
  };
};

export type FeedComment = {
  id: string;
  feed_id?: string;
  comment_id?: string;
  user_id: string;
  full_name: string;
  avatar?: string;
  message: string;
  reaction_count: FeedReactionCount;
  my_reaction: ReactionTypeEnum | null;
  reply_count: number;
  created_at: string;
  updated_at: string;
};

type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

type ListResponse<T> = {
  list: T[];
  metapaging?: Metapaging;
};

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

function hasMoreFromMetapaging(metapaging?: Metapaging): boolean {
  return metapaging ? metapaging.current_page < metapaging.total_page : false;
}

export async function listFeeds(
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: FeedTimelineItem[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<FeedTimelineItem>>("/api/v1/feeds/list", {
    method: "POST",
    token: sessionToken,
    body: { page, page_size: pageSize },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listFeeds] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export async function createFeed(
  payload: CreateFeedPayload
): Promise<ApiEnvelope<Feed>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<Feed>("/api/v1/feeds/create", {
    method: "POST",
    token: sessionToken,
    body: payload,
  });
}

export async function listFeedComments(
  feedId: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: FeedComment[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<FeedComment>>("/api/v1/feeds/comments/list", {
    method: "POST",
    token: sessionToken,
    body: { feed_id: feedId, page, page_size: pageSize },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listFeedComments] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export async function createFeedComment(payload: {
  feedId: string;
  message: string;
}): Promise<ApiEnvelope<FeedComment>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<FeedComment>("/api/v1/feeds/comments/create", {
    method: "POST",
    token: sessionToken,
    body: { feed_id: payload.feedId, message: payload.message },
  });
}

export async function listCommentReplies(
  commentId: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: FeedComment[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<FeedComment>>(
    "/api/v1/feeds/comments/replies/list",
    {
      method: "POST",
      token: sessionToken,
      body: { comment_id: commentId, page, page_size: pageSize },
    }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listCommentReplies] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export async function createCommentReply(payload: {
  commentId: string;
  message: string;
}): Promise<ApiEnvelope<FeedComment>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<FeedComment>("/api/v1/feeds/comments/replies/create", {
    method: "POST",
    token: sessionToken,
    body: { comment_id: payload.commentId, message: payload.message },
  });
}

export async function deleteComment(commentId: string): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/feeds/comments/delete", {
    method: "POST",
    token: sessionToken,
    body: { id: commentId },
  });
}

export async function deleteCommentReply(replyId: string): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/feeds/comments/replies/delete", {
    method: "POST",
    token: sessionToken,
    body: { id: replyId },
  });
}

export async function deleteFeed(feedId: string): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi("/api/v1/feeds/delete", {
    method: "POST",
    token: sessionToken,
    body: { id: feedId },
  });
}

export type RepostResult = { feed_id: string; reposter_id: string };

export async function repostFeed(feedId: string): Promise<ApiEnvelope<RepostResult>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<RepostResult>("/api/v1/feeds/repost", {
    method: "POST",
    token: sessionToken,
    body: { feed_id: feedId },
  });
}

export async function unrepostFeed(feedId: string): Promise<ApiEnvelope<RepostResult>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }

  return callApi<RepostResult>("/api/v1/feeds/unrepost", {
    method: "POST",
    token: sessionToken,
    body: { feed_id: feedId },
  });
}
