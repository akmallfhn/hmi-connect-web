import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getEventDetail } from "@/apis/events";
import { getSession } from "@/apis/session";
import { getSpecialBodyDetail } from "@/apis/special-bodies";
import { selectedActingEntityRef } from "@/lib/acting-entity";
import { formatSpecialBodyName } from "@/lib/special-body";
import PublicEventDetailPage from "@/components/pages/PublicEventDetailPage";

const loadEvent = cache(getEventDetail);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ event_id: string }>;
}): Promise<Metadata> {
  const { event_id } = await params;
  const event = await loadEvent(event_id);
  return {
    title: event?.title ?? "Detail Event",
    robots: { index: false, follow: false },
  };
}

export default async function EventDetailRoute({
  params,
}: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await params;
  const { user } = await getSession();
  if (!user) {
    redirect(
      `/auth/login?redirectTo=${encodeURIComponent(`/events/${event_id}`)}`,
    );
  }
  if (user.status === "pending") redirect("/activation");
  const event = await loadEvent(event_id);
  if (!event) notFound();
  const specialBody = event.entity_type === "special_body"
    ? await getSpecialBodyDetail(event.entity_id)
    : null;
  const organizerName = specialBody
    ? formatSpecialBodyName(specialBody.type, specialBody.parent_entity_type, specialBody.name)
    : undefined;
  const canChat = !(await selectedActingEntityRef(user));
  return (
    <PublicEventDetailPage
      viewer={user}
      event={event}
      canChat={canChat}
      organizerName={organizerName}
    />
  );
}
