import { youTubeEmbedUrl } from "@/lib/youtube";

export default function YouTubeEmbed({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) {
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
        src={youTubeEmbedUrl(videoId)}
        title="Video YouTube"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
