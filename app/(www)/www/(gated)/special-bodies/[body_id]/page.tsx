import { notFound, redirect } from "next/navigation";
import { getSpecialBodyDetail } from "@/apis/special-bodies";

export default async function SpecialBodyIdRedirect({ params }: {
  params: Promise<{ body_id: string }>;
}) {
  const { body_id } = await params;
  const body = await getSpecialBodyDetail(body_id);
  if (!body || body.status !== "active") notFound();
  redirect(`/mentions/${encodeURIComponent(body.mention_name)}`);
}
