import { GraduationCap } from "lucide-react";
import type { Degree } from "@/lib/types";
import { PLACEHOLDER_EDUCATION } from "./mockData";

const DEGREE_LABELS: Record<Degree, string> = {
  diploma_ahli_pratama: "Diploma (Ahli Pratama)",
  diploma_ahli_muda: "Diploma (Ahli Muda)",
  diploma_ahli_madya: "Diploma (Ahli Madya)",
  sarjana: "Sarjana",
  magister: "Magister",
  doktor: "Doktor",
};

export default function EducationCard() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#172033]">Pendidikan</h2>

      <div className="mt-3 flex flex-col gap-4">
        {PLACEHOLDER_EDUCATION.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#172033]">
                {entry.institution}
              </p>
              <p className="text-sm text-[#5f6573]">
                {DEGREE_LABELS[entry.degree]} • {entry.major}
              </p>
              <p className="text-xs text-[#5f6573]">
                {entry.startYear} – {entry.endYear ?? "Sekarang"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
