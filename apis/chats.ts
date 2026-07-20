import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus, type MessageStatusEnum } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export type ConversationSummary = {
  id: string;
  other_user_id: string;
  other_full_name: string;
  other_username?: string;
  other_avatar?: string;
  other_chapter_name?: string;
  other_branch_name?: string;
  other_coordinating_body_name?: string;
  last_message_id?: string;
  last_message_content?: string;
  last_message_attachment_url?: string;
  last_message_sender_id?: string;
  last_message_at?: string;
  unread: boolean;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  status: MessageStatusEnum;
  read_at?: string;
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

export async function listConversations(
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: ConversationSummary[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 20 } = options;
  const result = await callApi<ListResponse<ConversationSummary>>(
    "/api/v1/conversations/list",
    { method: "POST", token: sessionToken, body: { page, page_size: pageSize } }
  );

  if (!isSuccessStatus(result.status)) {
    console.error("[listConversations] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

// No lookup-by-user endpoint exists, so this scans the caller's own conversations/list.
export async function findConversationWithUser(otherUserId: string): Promise<string | null> {
  const { list } = await listConversations({ pageSize: 100 });
  const match = list.find((conversation) => conversation.other_user_id === otherUserId);
  return match?.id ?? null;
}

export async function deleteConversation(id: string): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }
  return callApi("/api/v1/conversations/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export async function listMessages(
  conversationId: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<{ list: ChatMessage[]; hasMore: boolean }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { list: [], hasMore: false };

  const { page = 1, pageSize = 30 } = options;
  const result = await callApi<ListResponse<ChatMessage>>("/api/v1/messages/list", {
    method: "POST",
    token: sessionToken,
    body: { conversation_id: conversationId, page, page_size: pageSize },
  });

  if (!isSuccessStatus(result.status)) {
    console.error("[listMessages] request failed:", result);
    return { list: [], hasMore: false };
  }

  return {
    list: result.data?.list ?? [],
    hasMore: hasMoreFromMetapaging(result.data?.metapaging),
  };
}

export type SendMessagePayload = {
  conversationId?: string;
  recipientId?: string;
  content?: string;
  attachmentUrl?: string;
};

export async function sendChatMessage(
  payload: SendMessagePayload
): Promise<{ message: ChatMessage | null; envelope: ApiEnvelope<ChatMessage> }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    const envelope: ApiEnvelope<ChatMessage> = {
      status: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
    return { message: null, envelope };
  }

  const envelope = await callApi<ChatMessage>("/api/v1/messages/send", {
    method: "POST",
    token: sessionToken,
    body: {
      conversation_id: payload.conversationId,
      recipient_id: payload.recipientId,
      content: payload.content,
      attachment_url: payload.attachmentUrl,
    },
  });

  return {
    message: isSuccessStatus(envelope.status) ? envelope.data ?? null : null,
    envelope,
  };
}

export async function updateChatMessage(
  id: string,
  content: string
): Promise<ApiEnvelope<ChatMessage>> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }
  return callApi<ChatMessage>("/api/v1/messages/update", {
    method: "POST",
    token: sessionToken,
    body: { id, content },
  });
}

export async function deleteChatMessage(id: string): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { status: "UNAUTHORIZED", message: "Session expired. Please log in again." };
  }
  return callApi("/api/v1/messages/delete", {
    method: "POST",
    token: sessionToken,
    body: { id },
  });
}

export async function markMessagesAsRead(
  conversationId: string
): Promise<{ markedCount: number }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { markedCount: 0 };

  const result = await callApi<{ marked_count: number }>(
    "/api/v1/messages/mark-as-read",
    { method: "POST", token: sessionToken, body: { conversation_id: conversationId } }
  );

  if (!isSuccessStatus(result.status)) return { markedCount: 0 };
  return { markedCount: result.data?.marked_count ?? 0 };
}
