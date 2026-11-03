import Image from "next/image";
import Link from "next/link";
import { KONGRES_HASHTAG, KONGRES_PHOTOS } from "@/lib/kongres-data";
import { TapisBand } from "./KongresDecor";

// CC BY/BY-SA photos require visible attribution, so every hotlinked photo is credited here.
const PHOTO_CREDITS = Object.values(KONGRES_PHOTOS);

export default function KongresFooter() {
  return (
    <footer className="bg-[#04291a] text-white">
      <TapisBand className="text-[#e8b628]" />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Image
            src="/images/kongres/logo-kongres-xxxiii-horizontal.png"
            alt="Kongres XXXIII Himpunan Mahasiswa Islam, Bandar Lampung 28 November – 5 Desember 2026"
            width={1600}
            height={437}
            className="h-auto w-full max-w-md"
          />
          <div className="flex flex-col gap-2 text-sm lg:items-end">
            <p className="font-semibold text-[#f6d77a]">#{KONGRES_HASHTAG}</p>
            <Link href="/" className="text-white/65 hover:text-white hover:underline">
              Kembali ke HMI Connect
            </Link>
          </div>
        </div>

        <details className="group mt-10 border-t border-white/10 pt-5">
          <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white/80">
            Kredit foto <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </summary>
          <ul className="mt-3 grid gap-1.5 text-xs text-white/50 sm:grid-cols-2">
            {PHOTO_CREDITS.map((photo) => (
              <li key={photo.src}>
                <a
                  href={photo.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/80 hover:underline"
                >
                  {photo.alt}
                </a>{" "}
                · {photo.credit} · {photo.license} via Wikimedia Commons
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
