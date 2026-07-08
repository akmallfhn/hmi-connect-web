import { NextResponse } from "next/server";

export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string;
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function extractMetaContent(html: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }
  return undefined;
}

function ogPatterns(property: string): RegExp[] {
  return [
    new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:${property}["']`, "i"),
  ];
}

function extractOpenGraph(html: string, baseUrl: URL) {
  const title =
    extractMetaContent(html, ogPatterns("title")) ??
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  const description = extractMetaContent(html, [
    ...ogPatterns("description"),
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  ]);
  const rawImage = extractMetaContent(html, ogPatterns("image"));
  const siteName = extractMetaContent(html, ogPatterns("site_name"));

  let image: string | undefined;
  if (rawImage) {
    try {
      image = new URL(rawImage, baseUrl).toString();
    } catch {
      image = undefined;
    }
  }

  return { title, description, image, siteName };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const fallback: LinkPreview = {
    url: parsed.toString(),
    title: null,
    description: null,
    image: null,
    siteName: parsed.hostname,
  };

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HMIConnectBot/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return NextResponse.json(fallback);

    const html = await response.text();
    const meta = extractOpenGraph(html, parsed);

    return NextResponse.json<LinkPreview>({
      url: parsed.toString(),
      title: meta.title ?? null,
      description: meta.description ?? null,
      image: meta.image ?? null,
      siteName: meta.siteName ?? parsed.hostname,
    });
  } catch {
    return NextResponse.json(fallback);
  }
}
