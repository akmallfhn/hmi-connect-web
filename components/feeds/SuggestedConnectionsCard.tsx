"use client";

import { useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";
import { SUGGESTED_CONNECTIONS } from "./mockData";

interface SuggestedConnectionsCardProps {
  title?: string;
}

export default function SuggestedConnectionsCard({
  title = "Kader Disarankan",
}: SuggestedConnectionsCardProps) {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-4 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#172033]">
        <Users className="size-4 text-primary" />
        {title}
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {SUGGESTED_CONNECTIONS.map((connection) => {
          const isFollowing = Boolean(following[connection.id]);
          return (
            <div key={connection.id} className="flex items-center gap-3">
              <Avatar
                src={connection.avatar}
                name={connection.name}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#172033]">
                  {connection.name}
                </p>
                <p className="truncate text-xs text-[#5f6573]">
                  {connection.role}
                </p>
                <p className="text-xs text-[#5f6573]">
                  {connection.mutual} koneksi bersama
                </p>
              </div>
              <Button
                variant={isFollowing ? "outline" : "primary"}
                size="sm"
                onClick={() =>
                  setFollowing((prev) => ({
                    ...prev,
                    [connection.id]: !prev[connection.id],
                  }))
                }
              >
                {isFollowing ? "Mengikuti" : "Ikuti"}
              </Button>
            </div>
          );
        })}
      </div>

      <a
        href="#"
        className="mt-3 flex items-center justify-between border-t border-[#e6e9ef] pt-3 text-sm font-medium text-primary"
      >
        Lihat Semua Saran
        <ChevronRight className="size-4" />
      </a>
    </div>
  );
}
