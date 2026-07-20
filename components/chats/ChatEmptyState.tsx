"use client";

import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import Button from "../buttons/Button";
import NewMessageModal from "./NewMessageModal";

interface ChatEmptyStateProps {
  viewerId?: string;
}

// Desktop-only placeholder shown at the /chats index route inside the thread pane —
// mirrors Instagram's "Your Messages" empty state. Hidden on mobile by ChatsPage's own
// layout classes, since mobile shows only the conversation list at this route.
export default function ChatEmptyState({ viewerId }: ChatEmptyStateProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full border-2 border-[#172033]">
        <SendHorizontal className="size-9 -translate-x-0.5 text-[#172033]" />
      </div>
      <div>
        <p className="text-xl font-semibold text-[#172033]">Pesan Anda</p>
        <p className="mt-1 max-w-xs text-sm text-[#7b8190]">
          Kirim foto dan pesan pribadi ke sesama kader HMI.
        </p>
      </div>
      <Button variant="primary" size="pillSm" onClick={() => setOpen(true)}>
        Kirim Pesan
      </Button>

      <NewMessageModal open={open} onClose={() => setOpen(false)} viewerId={viewerId} />
    </div>
  );
}
