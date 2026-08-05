import EmptyState from "../states/EmptyState";

export default function TrainingEvaluationTab() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
      <EmptyState
        title="Belum ada penilaian"
        description="Data penilaian untuk training ini belum tersedia."
      />
    </section>
  );
}
