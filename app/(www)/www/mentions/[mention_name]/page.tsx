import { notFound, redirect } from "next/navigation";
import { getMentionTarget } from "@/apis/search";
import { entityProfileHref } from "@/lib/feed-author";

interface MentionRouteProps {
  params: Promise<{ mention_name: string }>;
}

export default async function MentionRoute({ params }: MentionRouteProps) {
  const { mention_name: mentionName } = await params;
  const target = await getMentionTarget(mentionName);
  if (!target) return notFound();
  if (target.target_type === "user") {
    redirect(`/profile/${encodeURIComponent(target.mention_name)}`);
  }
  // Entity profiles are addressed by their lowercase mention name.
  redirect(entityProfileHref(target.target_type, target.mention_name_normalized));
}
