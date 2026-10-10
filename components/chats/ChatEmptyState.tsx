"use client";

import { useState } from "react";
import Button from "../buttons/Button";
import SendMessageIllustration from "../illustrations/SendMessageIllustration";
import NewMessageModal from "./NewMessageModal";

interface ChatEmptyStateProps {
  viewerId?: string;
}

export default function ChatEmptyState({ viewerId }: ChatEmptyStateProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <SendMessageIllustration className="w-52 max-w-full" />
      <div>
        <p className="text-xl font-semibold text-heading">Pesan Kamu</p>
        <p className="mt-1 max-w-xs text-[15px] text-subtle-foreground">
          Kirim foto dan pesan pribadi ke sesama kader HMI.
        </p>
      </div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Kirim Pesan
      </Button>
      <NewMessageModal
        open={open}
        onClose={() => setOpen(false)}
        viewerId={viewerId}
      />
    </div>
  );
}
