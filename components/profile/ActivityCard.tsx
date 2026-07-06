"use client";

import { Heart, MessageCircle, Share2, Trophy } from "lucide-react";
import { PLACEHOLDER_ACTIVITY } from "./mockData";

export default function ActivityCard() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#172033]">Aktivitas</h2>

      <div className="mt-3 flex flex-col gap-4">
        {PLACEHOLDER_ACTIVITY.map((post) => (
          <article
            key={post.id}
            className="border-t border-[#e6e9ef] pt-4 first:border-t-0 first:pt-0"
          >
            <p className="text-xs text-[#5f6573]">{post.timestamp}</p>

            {post.badge && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <Trophy className="size-3.5" />
                {post.badge}
              </div>
            )}

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#172033]">
              {post.content}
            </p>

            <div className="mt-3 flex items-center gap-4 text-xs text-[#5f6573]">
              <span className="flex items-center gap-1.5">
                <Heart className="size-3.5" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-3.5" />
                {post.comments}
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="size-3.5" />
                {post.shares}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
