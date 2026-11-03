import { KONGRES_PHOTOS } from "@/lib/kongres-data";

// CC BY/BY-SA photos require visible attribution, so every hotlinked photo is credited here.
const PHOTO_CREDITS = Object.values(KONGRES_PHOTOS);

export default function KongresPhotoCredits() {
  return (
    <details className="group px-1 text-xs text-muted-foreground">
      <summary className="cursor-pointer list-none font-semibold hover:text-heading">
        Kredit foto <span className="group-open:hidden">+</span>
        <span className="hidden group-open:inline">−</span>
      </summary>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {PHOTO_CREDITS.map((photo) => (
          <li key={photo.src}>
            <a
              href={photo.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-heading hover:underline"
            >
              {photo.alt}
            </a>{" "}
            · {photo.credit} · {photo.license} via Wikimedia Commons
          </li>
        ))}
      </ul>
    </details>
  );
}
