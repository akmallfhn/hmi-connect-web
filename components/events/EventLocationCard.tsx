import { IconExternalLink } from "@tabler/icons-react";
import {
  eventDirectionsUrl,
  eventMapEmbedUrl,
  splitEventLocation,
} from "@/lib/event-ui";
import EventLinkButton from "./EventLinkButton";

export default function EventLocationCard({
  locationName,
  locationUrl,
}: {
  locationName?: string;
  locationUrl?: string;
}) {
  const mapUrl = eventMapEmbedUrl(locationUrl, locationName);
  const directionsUrl = eventDirectionsUrl(locationUrl, locationName);
  const { place, address } = splitEventLocation(locationName);
  if (!mapUrl && !place) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      {mapUrl && (
        <div className="aspect-[4/3] bg-surface-muted sm:aspect-[21/9]">
          <iframe
            src={mapUrl}
            title={`Peta lokasi ${place || "event"}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full border-0"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="break-words font-stack-sans-headline text-lg font-medium text-heading">
          {place || "Lokasi event"}
        </h2>
        {address && (
          <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">{address}</p>
        )}
        {directionsUrl && (
          <EventLinkButton
            href={directionsUrl}
            newTab
            variant="outline"
            className="mt-3"
          >
            Petunjuk arah
            <IconExternalLink className="size-4" stroke={2} />
          </EventLinkButton>
        )}
      </div>
    </section>
  );
}
