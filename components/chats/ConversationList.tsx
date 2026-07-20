"use client";

import { Search, SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
import { useChatConversations } from "./ChatConversationsContext";
import ConversationListItem from "./ConversationListItem";
import NewMessageModal from "./NewMessageModal";

interface ConversationListProps {
  viewerId?: string;
  activeConversationId?: string;
}

export default function ConversationList({ viewerId, activeConversationId }: ConversationListProps) {
  const { conversations, loading, hasMore, loadingMore, loadMore } = useChatConversations();
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((conversation) =>
      conversation.other_full_name.toLowerCase().includes(normalized) ||
      conversation.other_username?.toLowerCase().includes(normalized)
    );
  }, [conversations, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-[#e6e9ef] px-4 py-3.5 lg:h-[72px] lg:py-0">
        <h1 className="text-lg font-bold text-[#172033]">Pesan</h1>
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          aria-label="Pesan baru"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#172033] transition hover:bg-[#f5f7fb]"
        >
          <SquarePen className="size-5" />
        </button>
      </div>

      <div className="shrink-0 px-4 py-3">
        <label className="relative block">
          <span className="sr-only">Cari pesan</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7b8190]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari"
            className="h-10 w-full rounded-full border border-[#dbe3ef] bg-[#f5f7fb] pl-10 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 lg:pb-2">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-[#7b8190]">Memuat...</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[#7b8190]">
            {query ? "Tidak ada percakapan yang cocok." : "Belum ada percakapan."}
          </p>
        ) : (
          <>
            {filtered.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                viewerId={viewerId}
                active={conversation.id === activeConversationId}
              />
            ))}
            {!query && hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex w-full cursor-pointer items-center justify-center py-4 text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-[#9aa1ad]"
              >
                {loadingMore ? "Memuat..." : "Muat lebih banyak"}
              </button>
            )}
          </>
        )}
      </div>

      <NewMessageModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        viewerId={viewerId}
      />
    </div>
  );
}
