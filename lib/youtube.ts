const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// Accepts watch, youtu.be, shorts, embed, and live links; returns null for anything else.
export function parseYouTubeId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, first, second] = url.pathname.split("/");
    if (first === "watch") id = url.searchParams.get("v");
    else if (["shorts", "embed", "live", "v"].includes(first))
      id = second ?? null;
  }

  return id && YOUTUBE_ID.test(id) ? id : null;
}

export function youTubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youTubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
