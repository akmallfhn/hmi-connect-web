import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SendMessageIllustration from "../illustrations/SendMessageIllustration";
import {
  Bar,
  ChatThreadHeaderSkeleton,
  MessageComposerSkeleton,
  MessageThreadSkeleton,
} from "../states/Skeleton";

// The back arrow is real here for the same reason it is in ChatThreadHeader: it needs no data.
function PaneHeaderSkeleton() {
  return (
    <div className="flex shrink-0 flex-col border-b border-[#e6e9ef] bg-white">
      <div className="flex items-center gap-1 px-3 py-2.5 lg:h-[72px] lg:px-5 lg:py-0">
        <Link
          href="/chats"
          aria-label="Kembali ke pesan"
          className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-full text-[#172033] transition hover:bg-[#f5f7fb] lg:hidden"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <ChatThreadHeaderSkeleton />
      </div>
      <div className="flex animate-pulse items-center justify-center border-t border-[#e6e9ef] bg-[#f8fafb] px-3 py-1.5">
        <Bar className="h-2.5 w-56" />
      </div>
    </div>
  );
}

export function ChatThreadPaneSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <PaneHeaderSkeleton />
      <MessageThreadSkeleton />
      <MessageComposerSkeleton />
    </div>
  );
}

// A new thread never has messages, so only the recipient is unknown — the empty state is the real one.
export function NewThreadPaneSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <PaneHeaderSkeleton />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <SendMessageIllustration className="w-52 max-w-full" />
        <p className="text-[15px] text-[#7b8190]">
          Mulai percakapan dengan mengirim pesan pertama.
        </p>
      </div>
      <MessageComposerSkeleton />
    </div>
  );
}
