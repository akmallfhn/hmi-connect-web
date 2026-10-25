import { proxyMediaUpload } from "@/lib/media-upload-edge";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function PUT(request: Request) {
  return proxyMediaUpload(request);
}
