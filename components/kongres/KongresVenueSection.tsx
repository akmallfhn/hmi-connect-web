import {
  IconBus,
  IconBuildingStadium,
  IconExternalLink,
  IconMapPin,
  IconPlane,
  IconShip,
} from "@tabler/icons-react";
import {
  KONGRES_MAIN_VENUE,
  KONGRES_TRANSPORT_ROUTES,
  type KongresTransportRoute,
} from "@/lib/kongres-data";
import { KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS, SectionHeading } from "./KongresDecor";

function mapEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function mapLinkUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapDirectionsUrl(origin: string) {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination: KONGRES_MAIN_VENUE.mapQuery,
    travelmode: "driving",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export default function KongresVenueSection() {
  return (
    <section id="lokasi" className={`border border-border bg-surface ${KONGRES_SECTION_CLASS}`}>
      <div className={KONGRES_SECTION_BODY}>
        <SectionHeading eyebrow="Peta Kongres" title="Lokasi & Akses Transportasi" />

        <article className="mt-10 grid overflow-hidden rounded-3xl border border-border bg-surface xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="bg-[#04291a] p-5 text-white sm:p-6">
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#e8b628]">
              <IconBuildingStadium className="size-7" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#f6d77a]">{KONGRES_MAIN_VENUE.label}</p>
            <h3 className="mt-1 font-stack-sans-headline text-2xl font-medium">{KONGRES_MAIN_VENUE.name}</h3>
            <p className="mt-2 text-sm leading-6 text-white/75">{KONGRES_MAIN_VENUE.description}</p>
            <div className="mt-5 flex gap-2 text-sm text-white/70">
              <IconMapPin className="mt-0.5 size-4 shrink-0 text-[#e8b628]" />
              {KONGRES_MAIN_VENUE.address}
            </div>
            <a
              href={mapLinkUrl(KONGRES_MAIN_VENUE.mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#f6d77a] hover:underline"
            >
              Buka lokasi
              <IconExternalLink className="size-4" />
            </a>
          </div>

          <div className="p-4 sm:p-5">
            <iframe
              title={`Peta ${KONGRES_MAIN_VENUE.name}`}
              src={mapEmbedUrl(KONGRES_MAIN_VENUE.mapQuery)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[16/10] w-full rounded-2xl border border-border xl:h-full xl:min-h-[320px] xl:aspect-auto"
            />
          </div>
        </article>

        <div className="mt-10">
          <h3 className="font-stack-sans-headline text-2xl font-medium text-heading">Akses menuju lokasi</h3>
          <ul className="mt-5 grid gap-4 xl:grid-cols-3">
            {KONGRES_TRANSPORT_ROUTES.map((route) => (
              <TransportCard key={route.id} route={route} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TransportCard({ route }: { route: KongresTransportRoute }) {
  const Icon = route.id === "airport" ? IconPlane : route.id === "port" ? IconShip : IconBus;

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#0a8a42]/10 text-[#0a8a42] dark:bg-[#e8b628]/10 dark:text-[#e8b628]">
        <Icon className="size-5" />
      </div>
      <h4 className="mt-4 font-stack-sans-headline text-lg font-medium text-heading">{route.title}</h4>
      <ol className="mt-3 flex flex-1 list-decimal flex-col gap-2 pl-5 text-sm leading-6 text-muted-foreground marker:font-semibold marker:text-[#0a8a42] dark:marker:text-[#e8b628]">
        {route.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <a
        href={mapDirectionsUrl(route.mapOrigin)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a8a42] hover:underline dark:text-[#e8b628]"
      >
        {route.mapLabel}
        <IconExternalLink className="size-4" />
      </a>
    </li>
  );
}
