"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import Modal from "./Modal";
import type { Reactor } from "@/apis/reactions";
import { listReactors } from "@/lib/actions";
import type { ReactionTargetTypeEnum } from "@/lib/types";

interface ReactorsListModalProps {
  open: boolean;
  onClose: () => void;
  targetType: ReactionTargetTypeEnum;
  targetId: string;
}

export default function ReactorsListModal({
  open,
  onClose,
  targetType,
  targetId,
}: ReactorsListModalProps) {
  const [reactors, setReactors] = useState<Reactor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    listReactors(targetType, targetId, 1).then((result) => {
      if (cancelled) return;
      setReactors(result.list);
      setHasMore(result.hasMore);
      setPage(1);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [open, targetType, targetId]);

  function handleLoadMore() {
    setLoadingMore(true);
    listReactors(targetType, targetId, page + 1)
      .then((result) => {
        setReactors((prev) => [...prev, ...result.list]);
        setHasMore(result.hasMore);
        setPage((prev) => prev + 1);
      })
      .finally(() => setLoadingMore(false));
  }

  return (
    <Modal open={open} onClose={onClose} title="Reaksi">
      <div className="flex flex-col gap-1">
        {!loaded && (
          <p className="py-4 text-center text-sm text-[#5f6573]">Memuat...</p>
        )}
        {loaded && reactors.length === 0 && (
          <p className="py-4 text-center text-sm text-[#5f6573]">Belum ada reaksi.</p>
        )}
        {reactors.map((reactor) => (
          <Link
            key={reactor.id}
            href={reactor.username ? `/profile/${reactor.username}` : "#"}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#f5f7fb]"
          >
            <Avatar src={reactor.avatar} name={reactor.full_name} size={40} />
            <p className="text-sm font-medium text-[#172033]">{reactor.full_name}</p>
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
