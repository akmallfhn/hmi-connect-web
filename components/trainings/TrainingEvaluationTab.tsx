import { ClipboardCheck } from "lucide-react";

export default function TrainingEvaluationTab() {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-[#e6e9ef] bg-white px-5 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
        <ClipboardCheck className="size-6" />
      </span>
      <h2 className="mt-4 text-base font-bold text-[#172033]">
        Belum ada penilaian
      </h2>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#5f6573]">
        Data penilaian untuk training ini belum tersedia.
      </p>
    </section>
  );
}
