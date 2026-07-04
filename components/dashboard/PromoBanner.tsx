import { Sparkles } from "lucide-react";
import Button from "../buttons/Button";

export default function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm">
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 left-10 size-24 rounded-full bg-white/10" />

      <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-bold">Lengkapi Profil Kaderisasi Kamu</p>
            <p className="mt-0.5 max-w-md text-sm text-white/85">
              Tambahkan riwayat pendidikan dan pelatihanmu supaya makin gampang
              terhubung dengan sesama kader.
            </p>
          </div>
        </div>
        <Button
          variant="light"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
        >
          Lengkapi Sekarang
        </Button>
      </div>
    </div>
  );
}
