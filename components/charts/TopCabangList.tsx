interface TopCabangListProps {
  entries: { name: string; value: number }[];
  title?: string;
  subtitle?: string;
}

export default function TopCabangList({
  entries,
  title = "Cabang dengan Kader Terbanyak",
  subtitle = "Top 5 cabang berdasarkan jumlah kader aktif",
}: TopCabangListProps) {
  const max = entries[0]?.value ?? 0;

  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#172033]">{title}</p>
      <p className="text-xs text-[#5f6573]">{subtitle}</p>

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-[#5f6573]">Belum ada data.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {entries.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-[#172033]">
                    {entry.name}
                  </p>
                  <p className="shrink-0 text-sm font-semibold text-[#172033]">
                    {entry.value.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f5f7fb]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${max > 0 ? (entry.value / max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
