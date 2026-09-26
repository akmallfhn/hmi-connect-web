"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, useInViewport } from "@/hooks/useInViewport";
import { youTubeEmbedUrl } from "@/lib/youtube";

const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";

export default function YouTubeEmbed({
  videoId,
  className,
  autoPlayInView = false,
}: {
  videoId: string;
  className?: string;
  autoPlayInView?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const visibleRef = useRef(false);
  const loadedRef = useRef(false);

  // Browsers only allow muted autoplay, so the embed starts muted when it plays itself.
  const src = autoPlayInView
    ? `${youTubeEmbedUrl(videoId)}?enablejsapi=1&mute=1&playsinline=1&rel=0`
    : youTubeEmbedUrl(videoId);

  function command(func: "playVideo" | "pauseVideo") {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      YOUTUBE_ORIGIN,
    );
  }

  useInViewport(
    iframeRef,
    (visible) => {
      visibleRef.current = visible;
      if (!loadedRef.current || prefersReducedMotion()) return;
      command(visible ? "playVideo" : "pauseVideo");
    },
    { enabled: autoPlayInView },
  );

  // Commands sent before the player is ready are dropped, so replay the wanted state once it is.
  useEffect(() => {
    if (!autoPlayInView) return;

    function handleMessage(event: MessageEvent) {
      if (
        event.origin !== YOUTUBE_ORIGIN ||
        event.source !== iframeRef.current?.contentWindow ||
        typeof event.data !== "string"
      ) {
        return;
      }
      try {
        const data = JSON.parse(event.data) as { event?: string };
        if (data.event !== "onReady" && data.event !== "initialDelivery")
          return;
      } catch {
        return;
      }
      if (visibleRef.current && !prefersReducedMotion()) command("playVideo");
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoPlayInView]);

  function handleLoad() {
    if (!autoPlayInView) return;
    loadedRef.current = true;
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening" }),
      YOUTUBE_ORIGIN,
    );
    if (visibleRef.current && !prefersReducedMotion()) command("playVideo");
  }

  return (
    <div
      className={[
        "relative aspect-video w-full overflow-hidden rounded-xl bg-black",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title="Video YouTube"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleLoad}
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
