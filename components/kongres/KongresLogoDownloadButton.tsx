"use client";

import { IconDownload } from "@tabler/icons-react";
import { downloadRemoteImage } from "@/lib/share-canvas";

// The logos live on the CDN, where <a download> only navigates, so fetch the bytes first.
export default function KongresLogoDownloadButton({
  href,
  downloadName,
}: {
  href: string;
  downloadName: string;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        void downloadRemoteImage(href, downloadName);
      }}
      className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0a8a42] text-sm font-semibold text-white transition hover:bg-[#08743a]"
    >
      <IconDownload className="size-4" />
      Unduh
    </a>
  );
}
