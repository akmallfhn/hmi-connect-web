"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import Modal from "./Modal";
import type { FollowUserEntry } from "@/apis/users";
import { listFollowers, listFollowing } from "@/lib/actions";

interface FollowListModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  type: "following" | "followers";
}

const TITLES: Record<FollowListModalProps["type"], string> = {
  following: "Mengikuti",
  followers: "Pengikut",
};

export default function FollowListModal({
  open,
  onClose,
  userId,
  type,
}: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUserEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchList = type === "following" ? listFollowing : listFollowers;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    fetchList(userId, 1).then((result) => {
      if (cancelled) return;
      setUsers(result.list);
      setHasMore(result.hasMore);
      setPage(1);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [open, userId, type, fetchList]);

  function handleLoadMore() {
    setLoadingMore(true);
    fetchList(userId, page + 1)
      .then((result) => {
        setUsers((prev) => [...prev, ...result.list]);
        setHasMore(result.hasMore);
        setPage((prev) => prev + 1);
      })
      .finally(() => setLoadingMore(false));
  }

  return (
    <Modal open={open} onClose={onClose} title={TITLES[type]}>
      <div className="flex flex-col gap-1">
        {!loaded && (
          <p className="py-4 text-center text-sm text-[#5f6573]">Memuat...</p>
        )}
        {loaded && users.length === 0 && (
          <p className="py-4 text-center text-sm text-[#5f6573]">
            {type === "following" ? "Belum mengikuti siapa pun." : "Belum ada pengikut."}
          </p>
        )}
        {users.map((user) => (
          <Link
            key={user.id}
            href={user.username ? `/profile/${user.username}` : "#"}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#f5f7fb]"
          >
            <Avatar src={user.avatar} name={user.full_name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#172033]">
                {user.full_name}
              </p>
              {user.username && (
                <p className="truncate text-xs text-[#5f6573]">@{user.username}</p>
              )}
            </div>
          </Link>
        ))}
        {hasMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="mt-2 cursor-pointer py-1.5 text-center text-sm font-semibold text-primary hover:underline"
          >
            {loadingMore ? "Memuat..." : "Muat lebih banyak"}
          </button>
        )}
      </div>
    </Modal>
  );
}
