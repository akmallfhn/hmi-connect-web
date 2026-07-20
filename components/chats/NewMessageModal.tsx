"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SearchPersonResult } from "@/apis/search";
import { listFollowing } from "@/lib/actions";
import { CHAT_NEW_RECIPIENT_KEY } from "@/lib/constants";
import Avatar from "../common/Avatar";
import Modal from "../modals/Modal";

const SEARCH_DEBOUNCE_MS = 350;
const FOLLOWING_SUGGESTIONS_LIMIT = 5;

interface MessagablePerson {
  id: string;
  full_name: string;
  username?: string;
  avatar?: string;
}

interface NewMessageModalProps {
  open: boolean;
  onClose: () => void;
  viewerId?: string;
}

export default function NewMessageModal({ open, onClose, viewerId }: NewMessageModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<MessagablePerson[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open || !viewerId) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setFollowingLoading(true);
      listFollowing(viewerId).then((result) => {
        if (cancelled) return;
        setFollowing(result.list.slice(0, FOLLOWING_SUGGESTIONS_LIMIT));
        setFollowingLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [open, viewerId]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    const requestId = ++requestIdRef.current;
    clearTimeout(debounceRef.current);

    if (!trimmed) {
      debounceRef.current = setTimeout(() => {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (requestId !== requestIdRef.current) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: trimmed });
        const response = await fetch(`/api/users/search?${params}`);
        const json = await response.json();
        if (requestId !== requestIdRef.current) return;
        setResults(json.data ?? []);
      } catch (error) {
        if (requestId === requestIdRef.current) {
          console.error("[NewMessageModal] people search failed:", error);
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  function handleSelect(person: MessagablePerson) {
    sessionStorage.setItem(CHAT_NEW_RECIPIENT_KEY, JSON.stringify(person));
    setQuery("");
    setResults([]);
    onClose();
    router.push("/chats/new");
  }

  const isSearching = query.trim().length > 0;

  return (
    <Modal open={open} onClose={onClose} title="Pesan Baru" panelClassName="max-w-md">
      <label className="relative mb-3 block">
        <span className="sr-only">Cari orang</span>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama atau username..."
          className="h-10 w-full rounded-full border border-[#dbe3ef] bg-[#f5f7fb] px-4 text-sm text-[#172033] outline-none transition placeholder:text-[#7b8190] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <div className="flex flex-col">
        {isSearching ? (
          <>
            {loading && (
              <p className="px-1 py-6 text-center text-sm text-[#7b8190]">Mencari...</p>
            )}
            {!loading && results.length === 0 && (
              <p className="px-1 py-6 text-center text-sm text-[#7b8190]">Tidak ditemukan.</p>
            )}
            {!loading &&
              results.map((person) => (
                <PersonRow key={person.id} person={person} onSelect={handleSelect} />
              ))}
          </>
        ) : (
          <>
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[#9aa1ad]">
              Mengikuti
            </p>
            {followingLoading && (
              <p className="px-1 py-6 text-center text-sm text-[#7b8190]">Memuat...</p>
            )}
            {!followingLoading && following.length === 0 && (
              <p className="px-1 py-6 text-center text-sm text-[#7b8190]">
                Anda belum mengikuti siapa pun.
              </p>
            )}
            {!followingLoading &&
              following.map((person) => (
                <PersonRow key={person.id} person={person} onSelect={handleSelect} />
              ))}
          </>
        )}
      </div>
    </Modal>
  );
}

function PersonRow({
  person,
  onSelect,
}: {
  person: MessagablePerson;
  onSelect: (person: MessagablePerson) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(person)}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-[#f5f7fb]"
    >
      <Avatar src={person.avatar} name={person.full_name} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">{person.full_name}</p>
        {person.username && (
          <p className="truncate text-xs text-[#7b8190]">@{person.username}</p>
        )}
      </div>
    </button>
  );
}
