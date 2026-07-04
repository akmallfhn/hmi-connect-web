"use client";

import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, Share2, Trophy } from "lucide-react";
import { useState } from "react";
import Avatar from "../common/Avatar";
import type { FeedPost } from "./mockData";

interface FeedPostCardProps {
  post: FeedPost;
}

export default function FeedPostCard({ post }: FeedPostCardProps) {
  const [liked, setLiked] = useState(Boolean(post.liked));
  const [likeCount, setLikeCount] = useState(post.likes);

  function toggleLike() {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  }

  return (
    <article className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar src={post.author.avatar} name={post.author.name} size={44} />
          <div>
            <p className="font-semibold text-[#172033]">{post.author.name}</p>
            <p className="text-xs text-[#5f6573]">{post.author.role}</p>
            <p className="text-xs text-[#5f6573]">{post.timestamp}</p>
          </div>
        </div>
        <button
          type="button"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#5f6573] transition hover:bg-[#f5f7fb]"
          aria-label="Opsi lainnya"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {post.badge && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Trophy className="size-3.5" />
          {post.badge}
        </div>
      )}

      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#172033]">
        {post.content}
      </p>

      {post.image && (
        <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-[#f5f7fb]">
          <Image
            src={post.image}
            alt={post.content.slice(0, 40)}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-[#5f6573]">
        <span>
          {likeCount} suka · {post.comments} komentar
        </span>
        <span>{post.shares} dibagikan</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 border-t border-[#e6e9ef] pt-2">
        <button
          type="button"
          onClick={toggleLike}
          className={[
            "flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition hover:bg-[#f5f7fb]",
            liked ? "text-secondary" : "text-[#5f6573]",
          ].join(" ")}
        >
          <Heart className={`size-4 ${liked ? "fill-secondary" : ""}`} />
          Suka
        </button>
        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-[#5f6573] transition hover:bg-[#f5f7fb]"
        >
          <MessageCircle className="size-4" />
          Komentar
        </button>
        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-[#5f6573] transition hover:bg-[#f5f7fb]"
        >
          <Share2 className="size-4" />
          Bagikan
        </button>
      </div>
    </article>
  );
}
